import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput,
  Button,
  ActivityIndicator 
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { countryCodes, CountryCode } from './countryCode';
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import { defaultContacts } from './constant';

interface Contact {
  id: string;
  name: string;
  countryCode: string;
  number: string;
}

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [dropdownItems] = useState(
    countryCodes.map(country => ({
      label: `${country.flag} ${country.code}`,
      value: country.code,
    }))
  );
  
  // Contact form state
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [number, setNumber] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('contacts');
      if (savedContacts) {
        setContacts([...JSON.parse(savedContacts), ...defaultContacts]);
      } else {
        await AsyncStorage.setItem('contacts', JSON.stringify(defaultContacts));
        setContacts(defaultContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const saveContact = async (newContact: Contact) => {
    try {
      const updatedContacts = [...contacts, newContact];
      await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const updatedContacts = contacts.filter(contact => contact.id !== id);
      await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const renderContactCard = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <LinearGradient
        colors={[ '#F8F0F3','#D9B1BE',]}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>
          {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Text>
      </LinearGradient>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactNumber}>{item.countryCode}-{item.number}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={24} color="black" />
        <Text style={styles.headerText}>Team Members</Text>
      </View>

      <FlatList
        data={contacts.slice(0, page * 5)}
        renderItem={renderContactCard}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isEndReached && !loading) {
            setLoading(true);
            setTimeout(() => {
              setPage(prev => prev + 1);
              setLoading(false);
            }, 1000);
          }
        }}
        ListFooterComponent={() => loading && <View><ActivityIndicator size="large" /></View>}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsDialogVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.fabText}>Add Members</Text>
      </TouchableOpacity>

      <Modal
        visible={isDialogVisible}
        animationType="slide"
        transparent={true}
      >
        {/* Add Contact Dialog */}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.nameInput}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.phoneInputRow}>
              <View style={styles.dropdownContainer}>
                <DropDownPicker
                  open={open}
                  value={selectedCountry.code}
                  items={dropdownItems}
                  setOpen={setOpen}
                  setValue={(callback) => {
                    const value = typeof callback === 'function' ? callback(selectedCountry.code) : callback;
                    const country = countryCodes.find(c => c.code === value);
                    if (country) setSelectedCountry(country);
                  }}
                  style={styles.dropdown}
                  textStyle={styles.dropdownText}
                  dropDownContainerStyle={styles.dropdownOptionsContainer}
                  listItemContainerStyle={styles.dropdownItemContainer}
                  selectedItemContainerStyle={styles.selectedItemContainer}
                  selectedItemLabelStyle={styles.selectedItemLabel}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                />
              </View>
              <TextInput
                style={styles.numberInput}
                placeholder="Phone Number"
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
                maxLength={selectedCountry.phoneLength}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsDialogVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={() => {
                  if (name && number.length === selectedCountry.phoneLength) {
                    saveContact({
                      id: Date.now().toString(),
                      name,
                      countryCode: selectedCountry.code,
                      number,
                    });
                    setIsDialogVisible(false);
                    setName('');
                    setNumber('');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 120,
    bottom: 40,
    backgroundColor: '#9C3353',
    borderRadius: 28,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff'
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 5,
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#D9B1BE',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000', // Changed text color to be more visible against the gradient
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  contactNumberContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: 250
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: '100%',
  },
  phoneInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 1000, 
  },
  dropdownContainer: {
    width: '32%',
    zIndex: 2000, 
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownItemContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionsContainer: {
    borderColor: '#ddd',
  },
  selectedItemContainer: {
    backgroundColor: '#F8F0F3',
  },
  selectedItemLabel: {
    color: '#9C3353',
    fontWeight: '600',
  },
  dropdownPlaceholder: {
    color: '#666',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    width: '65%',
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent:'flex-end',
    marginTop: 20,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 120,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F0F3',
    borderWidth: 1,
    borderColor: '#D9B1BE',
  },
  saveButton: {
    backgroundColor: '#9C3353',
  },
  cancelButtonText: {
    color: '#9C3353',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
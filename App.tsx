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
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { countryCodes, CountryCode } from './countryCode';

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
        setContacts(JSON.parse(savedContacts));
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
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactNumber}>{item.countryCode} {item.number}</Text>
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
        onEndReached={() => {
          setLoading(true);
          setTimeout(() => {
            setPage(prev => prev + 1);
            setLoading(false);
          }, 1000);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loading && <ActivityIndicator size="large" />}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsDialogVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
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
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <Picker
              selectedValue={selectedCountry.code}
              onValueChange={(itemValue) => {
                setSelectedCountry(countryCodes.find(c => c.code === itemValue)!);
              }}
            >
              {countryCodes.map(country => (
                <Picker.Item 
                  key={country.code} 
                  label={`${country.flag} ${country.code}`} 
                  value={country.code} 
                />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={number}
              onChangeText={setNumber}
              keyboardType="numeric"
              maxLength={selectedCountry.phoneLength}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsDialogVisible(false)} />
              <Button 
                title="Save" 
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
              />
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
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
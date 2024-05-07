import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker'

const AddData = () => {
    const [ftMade, setFtMade] = useState('');
    const [ftAttempted, setFtAttempted] = useState('');
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [eventType, setEventType] = useState('Ingame');

    const handleSubmit = () => {
        // Handle form submission logic here
        console.log('Form submitted:', { ftMade, ftAttempted, date, eventType });
    };

    return (
        <View style={styles.container}>
        <TextInput
            style={styles.input}
            placeholder="FT Made"
            value={ftMade}
            onChangeText={setFtMade}
            keyboardType="numeric"
        />
        <TextInput
            style={styles.input}
            placeholder="FT Attempted"
            value={ftAttempted}
            onChangeText={setFtAttempted}
            keyboardType="numeric"
        />
        <DatePicker
            date={date}
            onDateChange={setDate}
        />
        <View style={styles.eventTypeContainer}>
            <Text style={styles.eventTypeLabel}>Event Type:</Text>
            <Button title="Ingame" onPress={() => setEventType('Ingame')} />
            <Button title="Practice" onPress={() => setEventType('Practice')} />
        </View>
        <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    eventTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    eventTypeLabel: {
        marginRight: 10,
    },
});

export default AddData;

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { RadioButton } from 'react-native-paper'; 
const AddData = () => {
    const [ftMade, setFtMade] = useState('');
    const [ftAttempted, setFtAttempted] = useState('');
    const [date, setDate] = useState(new Date())
    const [eventType, setEventType] = useState('Ingame');
    const [checked, setChecked] = React.useState('first');

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
        <DateTimePicker 
            mode="date"
            display='spinner'
            value={date}
        />
        <View>
        <View style={styles.radioButtonContainer}>
            <RadioButton
            value="first"
            status={checked === 'first' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('first')}
            />
            <Text style={styles.radioButtonText}>In Game</Text>
        </View>
        <View style={styles.radioButtonContainer}>
                <RadioButton
                value="second"
                status={checked === 'second' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('second')}
                />
                <Text style={styles.radioButtonText}>Practice</Text>
            </View>
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
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    radioButtonText: {
        marginLeft: 8,
        fontSize: 16,
    },
});

export default AddData;

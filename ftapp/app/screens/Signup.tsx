import { View,  Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link } from '@react-navigation/native';

const Signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;


    const signUp = async () => {
        setLoading(true);
        if(password !== confirmPassword) {
            return alert("Passwords do not match")
        }
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Sign Up Failed ' + error.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <Text style={{fontSize: 35, textAlign: 'center', paddingBottom: 20}}>Sign Up</Text>
                <TextInput value={email} style={styles.input} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>
                <TextInput secureTextEntry={true} value={confirmPassword} style={styles.input} placeholder='Confirm Password' autoCapitalize='none' onChangeText={(text) => setConfirmPassword(text)}></TextInput>
                <Button title="Sign Up" onPress={signUp} />
                <Link to={{ screen: 'Login'}}>
                    Already have an account? Log In
                </Link>
            </KeyboardAvoidingView>
            
        </View>
    )
}

export default Signup;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        marginVertical: 4,
        height: 50, 
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'
    }
});
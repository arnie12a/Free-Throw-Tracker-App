import { View, Text, Button } from 'react-native';
import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { Link } from '@react-navigation/native';


interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: RouterProps) => {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Home</Text>

    

            <Button onPress={() => navigation.navigate('Inside', {screen: 'AddData'})} title="Add Free Throw Data" />
            <Button onPress={() => navigation.navigate('Inside', {screen: 'FTSummary'})} title="See Free Throw Statistics" />

            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />

        </View>
    )
}

export default Home;
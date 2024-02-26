import { Image, Pressable, ScrollView, StyleSheet, Text, View, Alert, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import TextInputStyled from '../../components/TextInputStyled'
import MainButton from '../../components/MainButton'

import AppleSignInButton from '../../components/AppleSignInButton'

import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseApp } from 'firebase/app';

import { firebaseAuth } from '../../../firebaseSetup'
import BackButton from '../../components/BackButton'
import { useDispatch } from 'react-redux'
// import { signIn } from '../../features/auth/auth'
import passwordValidation from '../../validations/PasswordValidation'
import { Form, useForm } from 'react-hook-form'
import ConfiguredGoogleSignInButton from '../../components/ConfiguredGoogleSignInButton'
import { signInDis } from '../../features/auth/auth'
import { collection, addDoc, setDoc, getDoc, doc } from 'firebase/firestore'
import { db } from '../../../firebaseSetup'


const SignUpScreen = ({ navigation }) => {



    const dispatch = useDispatch()

  

    const getUserFromDatabase = async (user) => {
        try {
            console.log(user.uid);
            const userRef = doc(db, 'users', user.uid); 
            
            const docSnap = await getDoc(userRef); 
            
            if (docSnap.exists()) {
                console.log("Document exists, returning data.");
                return docSnap.data();
            } else {
                console.log("Document does not exist, creating it.");
                await setDoc(userRef, { id: user.uid, name: user.displayName});
                console.log("Document created with user ID.");
            }
        } catch (e) {
            console.error("Error accessing or creating the user document:", e.message);
            Alert.alert("Error", e.message);
        }
    };


    const handleSignUp = async (data) => {
        try {

            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
            
            await updateProfile(userCredential.user, {
                displayName: `${data.firstName} ${data.lastName}`,
                photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/1280px-Cat_August_2010-4.jpg"
            });

 

            getUserFromDatabase(userCredential.user)
            dispatch(signInDis(userCredential.user.uid));

        } catch (error) {
            // Handle any errors that occurred during sign-up or profile update
            console.log('Error:', error.message);
            Alert.alert('Error:', error.message);
        }
    };
    
    

    type FormFields = {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        confirmPassword: string;
    }


    const {
        control,
        handleSubmit,
        setError,
        watch,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        criteriaMode: "all",
    })

    const password = watch("password");

    // Use useEffect to trigger confirmPassword validation when password changes
    useEffect(() => {
        if (password) {
            trigger("confirmPassword");
        }
    }, [password, trigger]);


    return (
        <ScrollView>
            <View style={{ flex: 1 }}>
                <BackButton navigation={navigation} />

                <Text style={styles.titleText}> An Account</Text>
                <View style={styles.inputs}>


                    <Text style={styles.subtitleText}>Sign up with email</Text>

                    <TextInputStyled
                        errors={errors}
                        control={control}
                        name={'email'}
                        rules={{
                            required: "Please enter your email.",
                            // pattern: {
                            //     value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                            //     message: "Please enter a valid email address"
                            // }
                        }}
                        placeholder='Email Address' textContentType={'emailAddress'}
                        secureTextEntry={undefined} />


                    <TextInputStyled
                        errors={errors}
                        name={'firstName'}
                        control={control}
                        rules={{ required: "Please enter your first name." }}
                        placeholder='First Name'
                        secureTextEntry={undefined}
                        textContentType={undefined} />
                    <TextInputStyled
                        errors={errors}
                        name={"lastName"}
                        control={control}
                        rules={{ required: "Please enter your last name." }}
                        placeholder='Last Name'
                        secureTextEntry={undefined}
                        textContentType={undefined} />
                    <TextInputStyled
                        errors={errors}
                        name={'password'}
                        control={control}
                        rules={{}}
                        // rules={passwordValidation}
                        placeholder='Password'
                        secureTextEntry={true}
                        textContentType={undefined} />
                    <TextInputStyled
                        errors={errors}
                        name={'confirmPassword'}
                        control={control}
                        rules={{
                            validate: value => value === password || 'Passwords Do No Match'
                        }}
                        placeholder='Confirm Password'
                        secureTextEntry={true}
                        textContentType={undefined} />


                </View>
                <View style={styles.buttonContainer}>
                    {isSubmitting ? <Text>Submitting</Text> : <MainButton

                        onPress={
                            isSubmitting ?
                                null : handleSubmit(handleSignUp)

                        }
                        text={isSubmitting ? "Loading..." : "SIGN UP"}
                        color={"grey"} />}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
                    </View>
                    <View style={styles.socialSignIn}>
                        <View style={styles.button}>
                            {/* <ConfiguredGoogleSignInButton /> */}
                        </View>
                        <View style={{ marginBottom: 15 }}>
                            <AppleSignInButton />
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>

    )
}

export default SignUpScreen

const styles = StyleSheet.create({
    backButton: {
        marginLeft: 8,
        marginTop: 8
    },
    titleText: {
        marginTop: 15,
        fontSize: 45,
        textAlign: 'center',
        marginBottom: 30
    },
    inputs: {
        alignSelf: 'center',
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 40
    },
    subtitleText: {
        fontSize: 30,
        fontWeight: '400',
        marginBottom: 15
    },
    socialSignIn: {
        marginTop: 40,
    },
    button: {
        marginBottom: 30
    }
})

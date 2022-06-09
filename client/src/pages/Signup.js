import React, { useState } from 'react'
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useSignUpUserMutation } from '../services/appAPi'
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import botImg from '../images/bot.jpg';





const Signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [signupUser, {isLoading, error}] = useSignUpUserMutation();
    const navigate = useNavigate();

    // image upload state
    const [image, setImage] = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);


    function validateImg(event) {
        // event.preventDefault();
        const file = event.target.files[0]; 
        if(file.size >= 10485760) {
            return alert("MAX file size should be less than 10mb");
        } else {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    async function uploadImage() {
        const data = new FormData()
        data.append('file', image)
        data.append('upload_preset', 'bfccdwsa');
        try {
            setUploadingImg(true);
            let res = await fetch('https://api.cloudinary.com/v1_1/dz0h3ujaj/image/upload', {
                method: 'post',
                body: data
            });
            const urlData = await res.json();
            setUploadingImg(false);
            return urlData.url;
        } catch(err) {
            setUploadingImg(false);
        }
    }

    async function handleSignup(event) {
        event.preventDefault();
        if(!image) {
            return alert('PLease upload your profile pic')
        }
        const url = await uploadImage(image);
        signupUser({name, email, password, picture: url}).then(({data}) => {
            if(data) {
                navigate("/chat");
            }
        })
    }

    return (
        <Container>
            <Row>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{
                        width: "80%",
                        maxWidth: 500
                    }} onSubmit={ handleSignup }>
                        <h1 className='text-center'>Create Account</h1>
                        <div className='signup-profile-pic__container'>
                            <img src={ imagePreview || botImg} className='signup-profile-pic' alt='📝'/>
                            <label htmlFor='image-upload' className='image-upload-label' >
                                <i className='fas fa-plus-circle add-picture-icon'></i>
                            </label>
                            <input type="file" id="image-upload" hidden accept='image/png, image/jpeg' onChange={validateImg} />
                        </div>
                        {error && <p className="alert alert-danger">{ error.data }</p>}
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Your name" onChange={e => setName(e.target.value)} value={name} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)} value={email} />
                            <Form.Text className="text-muted">
                                We'll never share your email with anyone else.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password} />
                        </Form.Group>
                        
                        <Button variant="primary" type="submit">
                            {uploadingImg || isLoading ? "Signing you up" : "Signup" }
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                Already have an account ? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
                <Col md={5} className="signup__bg">
                </Col>
            </Row>
            
        </Container>
    )
}

export default Signup
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import "./MessageForm.css";
import {AppContext} from '../context/appContext'
const MessageForm = () => {

    const [message, setMessage] = useState("");
    const user = useSelector(state => state.user);
    const { socket, currentRoom, setMessages, messages, privateMemberMsg } = useContext(AppContext);
    const messageEndRef = useRef(null)

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    function getFormattedDate() {
        const date = new Date();
        let year = date.getFullYear().toString();
        let month  = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        let day = date.getDate().toString()
        day = day.length > 1 ? day : '0' + day;
        return (month + "/" + day + "/" + year)
    
    }

    const todayDate = getFormattedDate();

    socket.off('room-messages').on('room-messages', (roomMessages) => {
        setMessages(roomMessages)
    })

    function handleSubmit(event) {
        event.preventDefault();
        if(!message) {
            return;
        }
        const today = new Date();
        const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
        const time = today.getHours() + ":" + minutes;
        const roomId = currentRoom;
        socket.emit('message-room', roomId, message, user, time, todayDate);
        setMessage("");
    }

    function scrollToBottom() {
        messageEndRef.current?.scrollIntoView({behaviour: 'smooth'})
    }
    

    

    return (
        <>
            <div className='messages-output'>
                {user && !privateMemberMsg?._id && <div className='alert alert-info'>You are in the {currentRoom} room</div>}
                {user && privateMemberMsg?._id &&
                    <>
                        <div className='alert alert-info conversation-info'>
                            <div>
                                Your conversation with { privateMemberMsg.name } 
                                <img src={privateMemberMsg.picture} className="conversation-profile-picture" alt=""/>
                            </div>
                        </div>
                    </>
                }
                {!user && (
                        <div className="alert alert-danger">Please login</div>
                    )
                }
                {user && messages.map(({_id: date, messagesByDate}, idx) => {
                    return (
                        <div key={idx}>
                            <p className='alert alert-info text-center message-date-indicator'>{date}</p>
                            {messagesByDate?.map(({content, time, from: sender}, msgIdx) => {
                                return (
                                    <div className={sender?.email === user?.email ? "message" : "incoming-message"} key={msgIdx}>
                                        <div className='message-inner'>
                                            <div className='d-flex align-items-center mb-3'>
                                                <img src={sender.picture} style={{ width: 35, height: 35, objectFit: 'cover', borderRadius: '50%', marginRight: 10 }} alt=""/>
                                                <p className='message-sender'>{sender._id === user?._id ? "You" : sender.name}</p>
                                            </div>
                                            <p className='message-content'>
                                                {content}
                                            </p>
                                            <p className='message-timestamp-left'>
                                                {time}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messageEndRef}></div>
                        </div>
                    )
                })}
            </div>
            <Form onSubmit={ handleSubmit }>
                <Row>
                    <Col md = {11}>
                        <Form.Group>
                            <Form.Control type="text" placeholder='your message' disabled={!user} value={message} 
                            onChange={e => setMessage(e.target.value)} ></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                        <Button variant="primary" type="submit" style={{width:"100%", backgroundColor: "orange"}} disabled={!user}>
                            <i className='fas fa-paper-plane'></i>
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default MessageForm
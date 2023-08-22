import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useHttp from "../../hooks/use-http";
import { chatActions } from "../../store/chat-slice";
import ChatAction from "./ChatAction";
import { addMessageRequest } from "../../store/chat-actions";
import { getAuth } from "../../utils/helper";

let firstRen = true
const ChatMessage = (props) => {
    const [page, setPage] = useState(1)
    const chatFeedBottomRef = useRef();
    const chatFeedTopRef = useRef();
    const [pagination, setPagination] = useState(false)
    const dispatch = useDispatch()
    const chat = useSelector(state => state.chat)
    const messages = useSelector(state => state.chat.messages)
    const params = useParams()
    const id = params.id
    const userId = getAuth().id
    const totalItems = props.totalItems

    const scrollBottom = useCallback(() => {
        if(pagination === true) {
            if (chatFeedTopRef.current) {
                chatFeedTopRef.current.scrollIntoView();
            }
            return
        }

        if(chat.initial) {
            const el = document.getElementById('chat-feed');
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        }else {
            if (chatFeedBottomRef.current) {
                chatFeedBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pagination, chat.initial])

    useEffect(() => {
        setTimeout(() => {
            scrollBottom()
        }, 10);
    }, [messages,scrollBottom])

    useEffect(() => {
        setTimeout(() => {
            const el = document.getElementById('chat-feed');
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
            firstRen = false
        }, 100)
    }, [])

    const sendMessage = (data) => {
        setPagination(false)
        dispatch(addMessageRequest(data, id))
    }

    const {
        isLoading: paginateLoading,
        error: paginateError,
        sendRequest: paginateRequest
    } = useHttp()

    const scrollHandler = (event) => {
        if(totalItems === messages.length || firstRen) {
            return
        }else {
            const element = event.target;
            if (element.scrollTop < 10 && !paginateLoading ) {
                const pg = page + 1
                setPagination(true)
                const applyData = (data) => {
                    const messages = data.data.messages
                    dispatch(chatActions.paginateMessage(messages))
                }
                setPage((prevState) => pg)
                paginateRequest({
                    url: 'http://localhost:5000/chat/message/' + id + '?page=' + pg,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }, applyData)
            }
        }

    }

    return (
        <>
            <div className="p-5 overflow-y-auto no-scrollbar relative mt-0" id='chat-feed' style={{ height: 'calc(100vh - 190px)' }}
                onScroll={scrollHandler}
            >
                
                {
                    paginateLoading && <div className="top-0 sticky text-center">loading ...</div>
                }
                {
                    messages && messages.map((msg, index) => (
                        <div key={msg.id} className={`${id === msg.from.id ? ' items-start text-start ': ' items-end text-end '} d-inline-block flex flex-col mb-2 `}>
                            {/* {index === 7 && <div ref={chatFeedTopRef}></div>} */}
                            { (msg.to.id === id || msg.from.id === id) &&
                                <>
                                    {
                                        msg.image && <img src={msg.image} className="w-[180px] rounded-lg mb-1" alt="" />
                                    }
                                    {
                                        msg.text && <p className="max-w-[75%] bg-[#36404A] rounded-lg py-3 p-2">{msg.text}</p>
                                    }
                                </>
                            }
                        </div>
                    ))
                }
                {
                    chat.tempMsg && 
                    <div>
                        <p className='mb-3 text-end text-[#ffffff82]' >{chat.tempMsg}</p>
                    </div>
                }
                <div ref={chatFeedBottomRef} className="" ></div>
            </div>

            <ChatAction onSendMessage={sendMessage} />
        </>
    );
};

export default ChatMessage;

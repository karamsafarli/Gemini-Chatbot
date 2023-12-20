/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";


const Chatbot = () => {

    const [prompt, setPrompt] = useState();
    const [messages, setMessages] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const msgbox = useRef();

    const inputRef = useRef();

    const scrollToBottom = () => {
        if (msgbox.current) {
            msgbox.current.scrollTop = msgbox.current.scrollHeight;
        }
    };
    // let base_url = 'https://hakaton-server.vercel.app';
    let base_url = 'https://hakaton-server.onrender.com';
    // let base_url = 'https://odd-teal-stingray-boot.cyclic.app';
    // let base_url = 'https://devgram-2.vercel.app/api';
    // let base_url = 'http://localhost:3001';
    const fetchData = async (e) => {
        e.preventDefault();

        if (!prompt) {
            return alert("Empty prompt!")
        }

        const promptData = {
            prompt,
            imageParts: files
        };

        try {
            setPrompt('');
            setFiles([]);
            setImages([]);
            setIsLoading(true);
            setMessages((prevMessages) => [
                ...prevMessages,
                { prompt: prompt, answer: "..." },
            ]);
            const res = await fetch(`${base_url}/gemini`, {
                method: 'post',
                body: JSON.stringify(promptData),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const resdata = await res.json();
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[prevMessages.length - 1].answer = resdata;
                return updatedMessages;
            });
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setIsLoading(false);
        }

    }

    const [files, setFiles] = useState([]);
    const [images, setImages] = useState([]);

    // const fileToGenerativePart = async (file, mimeType) => {
    //     return new Promise((resolve, reject) => {
    //         if (!file) {
    //             reject(new Error('No file provided.'));
    //             return;
    //         }

    //         const reader = new FileReader();

    //         reader.onload = () => {
    //             const base64Data = reader.result.split(',')[1];

    //             resolve({
    //                 inlineData: {
    //                     data: base64Data,
    //                     mimeType
    //                 }
    //             });
    //         };

    //         reader.onerror = error => {
    //             reject(error);
    //         };

    //         reader.readAsDataURL(file);
    //     });
    // };

    const fileToGenerativePart = async (file, mimeType) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided.'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                const image = new Image();
                image.src = event.target.result;

                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDimensions = 800;

                    let width = image.width;
                    let height = image.height;

                    if (width > maxDimensions || height > maxDimensions) {
                        if (width > height) {
                            height *= maxDimensions / width;
                            width = maxDimensions;
                        } else {
                            width *= maxDimensions / height;
                            height = maxDimensions;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, width, height);

                    const compressedImageData = canvas.toDataURL(mimeType, 0.3);

                    resolve({
                        inlineData: {
                            data: compressedImageData.split(',')[1],
                            mimeType,
                        },
                    });
                };
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    };



    const onFileUpload = async (e) => {
        const files = Array.from(e.target.files);

        files.map(async (file) => {
            const fileURL = URL.createObjectURL(file);
            setImages((prev) => {
                const prevArr = [...prev];
                prevArr.push(fileURL);
                return prevArr;
            })
            try {
                const result = await fileToGenerativePart(file, file.type);
                setFiles((prev) => {
                    const prevFiles = [...prev];
                    prevFiles.push({ inlineData: result.inlineData });
                    return prevFiles;
                });

            } catch (error) {
                console.log(error)
            }
        })
    }

    const removeImage = (index) => {
        const filteredImages = images.filter((_, idx) => {
            return index !== idx;
        });

        const filteredFiles = files.filter((_, idx) => {
            return index !== idx;
        });


        setFiles(filteredFiles);
        setImages(filteredImages);
    }


    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="chatbot">
            <div className="container">
                <nav>
                    <a href="https://github.com/karamsafarli?tab=repositories" rel="noreferrer" target="_blank">
                        <img src="/assets/github-logo.png" alt="" />
                    </a>
                    <a href="https://www.linkedin.com/in/karam-safarli-b85714256/" rel="noreferrer" target="_blank">
                        <img src="/assets/linkedin_logo.png" alt="" />
                    </a>
                    <a href="https://www.duckweb.az/" rel="noreferrer" target="_blank">
                        <img src="/assets/web_logo.png" alt="" />
                    </a>
                </nav>
                <div className="msgbox" ref={msgbox}>
                    {messages.length > 0 ? (messages.map((el, idx) => (
                        <div key={idx}>
                            <div className="prompt">
                                <h3>You</h3>
                                {el.prompt}</div>
                            <div className="answer">
                                <h3>
                                    <img src="/assets/chatbot_logo.png" alt="" />
                                    Google Gemini
                                </h3>
                                <div className="response">
                                    {
                                        el.answer === '...' &&
                                            isLoading ? (
                                            <div className="loading-dots">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>

                                        ) : (el.answer)
                                    }
                                </div>
                            </div>
                        </div>
                    ))) : (
                        <div className="imgcont">
                            <img src="/assets/gemini_logo.png" alt="" />
                            <h5>How can I help you today?</h5>
                        </div>
                    )
                    }
                </div>
                <form onSubmit={fetchData}>
                    <div className="input_container">
                        <input type="text" onChange={(e) => setPrompt(e.target.value)} placeholder="Message Gemini..."
                            value={prompt}
                        />

                        <div className="upload_image">
                            <input type="file" hidden ref={inputRef} onChange={onFileUpload} multiple />
                            {
                                images.length > 0 &&
                                images.map((img, idx) => (
                                    <div className="small_img" key={idx}>
                                        <img src={img} alt="" />

                                        <div className="remove_btn" onClick={() => removeImage(idx)}>
                                            <img src="/assets/close-button.png" alt="" />
                                        </div>
                                    </div>
                                ))
                            }
                            <button className="upload_img_btn" type="button" onClick={() => inputRef.current.click()}>
                                <img src="/assets/image_logo.png" alt="" />
                            </button>
                        </div>
                    </div>
                    <button className="submit_btn" type="submit">
                        <img src="/assets/up-arrow.png" alt="" />
                    </button>
                </form>

            </div>
        </div>
    )
}

export default Chatbot
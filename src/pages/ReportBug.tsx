import './styles/ReportBug.scss';
import {useNavigate} from "react-router-dom";
import {ArrowBack, Close} from "@mui/icons-material";
import {useRef, useState} from "react";
import {useNotifications} from "../utils";
import apiUrls, {apiClient, ImageUpload} from "../api";

export default function ReportBug() {
    const navigate = useNavigate();

    const message = useRef<HTMLTextAreaElement>(null);
    const image = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<string[]>([]);

    const withNoti = useNotifications();

    const handleAttach = () => {
        if (!image.current || !image.current.files || !image.current.files.length) return;

        const file = image.current.files[0];
        const formData = new FormData();
        formData.append('file', file);

        withNoti({
            type: 'loading',
            messages: {
                loading: 'Uploading image...',
                success: 'Image uploaded successfully',
                error: 'Failed to upload image'
            },
            action: async () => {
                const {data: {url: src}} = await apiClient.post<ImageUpload>(apiUrls.images.upload,
                    formData, {headers: {'Content-Type': 'multipart/form-data'}}
                );

                setImages([...images, src]);
            },
            onSuccess: () => image.current!.value = ''
        });
    }

    const handleRemove = (index: number) => setImages(images.filter((_, i) => i !== index));

    const handleSubmit = () => withNoti({
        type: 'loading',
        messages: {
            loading: 'Submitting report...',
            success: 'Report submitted successfully',
            error: 'Failed to submit report'
        },
        action: async () => apiClient.post(apiUrls.report, {message: message.current!.value, images}),
        onSuccess: () => navigate(-1)
    });

    return (
        <div className="ReportBug">
            <h1>Report a bug</h1>
            <button className="icon-n-text" onClick={() => navigate(-1)}><ArrowBack/> Back to previous page</button>

            <form onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
            }}>
                <div className="ReportBug__message">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" ref={message} placeholder="Describe the bug/error/problem you encountered..."
                              required/>
                </div>

                <div className="ReportBug__attach-wrapper">
                    <button type="button" onClick={handleAttach}>Attach image</button>
                    <input type="file" ref={image} accept="image/*"/>
                </div>
                <div className="ReportBug__images-wrapper">
                    <label>Images</label>
                    <div className="ReportBug__images">
                        {images.map((src, i) => (
                            <div className="ReportBug__image-wrapper" key={src}>
                                <img src={src} alt={src}/>
                                <button onClick={() => handleRemove(i)}><Close/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

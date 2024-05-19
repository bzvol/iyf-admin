import './styles/SearchBar.scss';
import React, {useRef, useState} from "react";
import {Close} from "@mui/icons-material";

export default function SearchBar({onSearch}: { onSearch: (query: string) => void | Promise<void> }) {
    const [isResetVisible, setResetVisible] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
        setResetVisible(e.target.value.length > 0);
    }

    const handleReset = () => {
        if (!inputRef.current) return;
        inputRef.current.value = "";
        onSearch("");
        setResetVisible(false);
    }

    return (
        <div className="SearchBar">
            <input type="text" placeholder="Search..." onChange={handleChange} ref={inputRef}/>
            {isResetVisible && <Close onClick={handleReset}/>}
        </div>
    );
}

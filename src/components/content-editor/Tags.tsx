import React from "react";
import './styles/Tags.scss';
import {Close, Tag} from "@mui/icons-material";

interface TagsProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Tags({tags, setTags}: TagsProps) {
    const handleAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter' || !event.currentTarget.value) return;
        let newTags = event.currentTarget.value.trim().split(/\s*,|;\s*/);
        newTags = newTags.filter(tag => !tags.includes(tag) && tag.length > 0);

        setTags(prev => [...prev, ...newTags]);
        event.currentTarget.value = '';
    }

    const handleRemove = (idx: number) => {
        setTags(prev => prev.filter((_, i) => i !== idx));
    }

    return (
        <div className="ContentEditor__tags-wrapper">
            <div className="ContentEditor__tag-input-wrapper">
                <Tag/>
                <input className="ContentEditor__tag-input" id="tag-input"
                      type="text" placeholder="Type tag, then press enter to add"
                      onKeyUp={handleAdd}/>
            </div>
            {tags.length > 0 &&
                <div className="ContentEditor__tags">
                    {tags.map((tag, idx) => (
                        <div key={tag} className="ContentEditor__tag">
                            <span>{tag}</span>
                            <Close onClick={() => handleRemove(idx)}/>
                        </div>
                    ))}
                </div>}
        </div>
    );
}
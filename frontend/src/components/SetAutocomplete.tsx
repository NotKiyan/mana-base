
import React, { useState, useEffect, useRef } from 'react';

interface SetOption {
    value: string;
    label: string;
}

interface SetGroup {
    label: string;
    options: SetOption[];
}

interface SetAutocompleteProps {
    options: SetGroup[];
    value: string[];
    onChange: (newValue: string[]) => void;
    placeholder?: string;
}

const SetAutocomplete: React.FC<SetAutocompleteProps> = ({ options, value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    const handleInputClick = () => {
        setIsOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setIsOpen(true);
    };

    const handleSelectOption = (optionValue: string) => {
        if (!value.includes(optionValue)) {
            onChange([...value, optionValue]);
        }
        setInputValue('');
        setIsOpen(false);
    };

    const handleRemoveOption = (optionValue: string) => {
        onChange(value.filter(v => v !== optionValue));
    };

    // Flatten options for easy lookup when rendering tags
    const allOptions = options.flatMap(group => group.options);

    const filteredOptions = options.map(group => ({
        ...group,
        options: group.options.filter(opt =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            opt.value.toLowerCase().includes(inputValue.toLowerCase())
        )
    })).filter(group => group.options.length > 0);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(val => {
                    const option = allOptions.find(o => o.value === val);
                    return (
                        <span key={val} className="flex items-center gap-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2 py-1 rounded text-sm">
                            <i className={`ss ss-${val} ss-1x`}></i>
                            {option ? option.label : val}
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(val)}
                                className="ml-1 hover:text-amber-600 dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </span>
                    );
                })}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-[#12121A] border border-slate-300 dark:border-white/10 focus:border-[#D4AF37] px-3 py-2 rounded-sm text-slate-900 dark:text-white outline-none"
            />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1A1A24] border border-slate-200 dark:border-[#D4AF37]/20 rounded-sm shadow-xl max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(group => (
                            <div key={group.label}>
                                <div className="px-3 py-1 bg-slate-100 dark:bg-[#050505]/50 text-xs text-slate-500 uppercase tracking-wider font-bold sticky top-0 backdrop-blur-sm">
                                    {group.label}
                                </div>
                                {group.options.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelectOption(option.value)}
                                        className={`px-3 py-2 cursor-pointer transition-colors flex items-center gap-3 ${value.includes(option.value)
                                            ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-[#D4AF37]/20 hover:text-amber-700 dark:hover:text-white'
                                            }`}
                                    >
                                        <i className={`ss ss-${option.value} ss-2x`}></i>
                                        <span>{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-slate-500 text-sm">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SetAutocomplete;

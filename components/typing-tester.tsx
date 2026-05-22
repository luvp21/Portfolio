"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump.",
    "Sphinx of black quartz, judge my vow.",
    "Bright vixens jump dozy fowl quack.",
    "Two driven jocks help fax my big quiz.",
    "Five quacking zephyrs jolt my wax bed.",
];

function pickSentence() {
    return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

export function TypingTester() {
    const [sentence, setSentence] = useState(pickSentence);
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState<number>(0);
    const [done, setDone] = useState(false);
    const [wpm, setWpm] = useState<number | null>(null);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Live timer — only runs when focused and typing
    useEffect(() => {
        if (startTime && !done && focused) {
            tickRef.current = setInterval(() => {
                setElapsed((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, [startTime, done, focused]);

    const reset = useCallback((newSentence?: string) => {
        setSentence(newSentence ?? pickSentence());
        setInput("");
        setStartTime(null);
        setElapsed(0);
        setDone(false);
        setWpm(null);
        setTimeout(() => inputRef.current?.focus(), 0);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // TAB changes sentence only when input is focused
        if (e.key === "Tab") {
            e.preventDefault();
            reset();
            return;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (done) return;
        const val = e.target.value;
        if (!startTime && val.length > 0) setStartTime(Date.now());
        // Only allow input up to sentence length
        if (val.length > sentence.length) return;
        setInput(val);

        if (val === sentence) {
            if (tickRef.current) clearInterval(tickRef.current);
            const mins = (Date.now() - (startTime ?? Date.now())) / 60000;
            setWpm(Math.round(sentence.split(" ").length / mins));
            setDone(true);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Target sentence with per-char highlighting */}
            <p
                className="font-mono text-[13px] leading-relaxed select-none cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {sentence.split("").map((char, i) => {
                    const typed = input[i];
                    const isCursor = i === input.length && !done && focused;
                    let cls = "text-muted-foreground/40";
                    if (isCursor) cls = "border-b-2 border-foreground text-muted-foreground/40";
                    else if (typed !== undefined)
                        cls = typed === char
                            ? "text-foreground"
                            : char === " "
                                ? "bg-red-500/30 text-muted-foreground"
                                : "text-red-400";
                    return <span key={i} className={cls}>{char}</span>;
                })}
            </p>

            {/* Actual input box */}
            <input
                ref={inputRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={done}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder={focused ? "" : "Click here to start typing..."}
                className="w-full bg-muted/10 border border-border/40 rounded px-3 py-1.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Footer: instructions + timer/wpm + restart */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/40 font-mono flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-border/30 text-[9px] bg-muted/20">TAB</kbd>
                    <span>new sentence</span>
                </span>

                <div className="flex items-center gap-2">
                    {(elapsed > 0 || done) && (
                        <span className="font-mono text-xs text-muted-foreground/60">
                            {done
                                ? <><span className="text-foreground font-semibold">{wpm}</span> wpm</>
                                : elapsed.toFixed(1)
                            }
                        </span>
                    )}
                    <button
                        onClick={() => reset()}
                        title="Restart"
                        className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                        <RotateCcw size={10} />
                        <span>restart</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

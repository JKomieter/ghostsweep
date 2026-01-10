import { useState, useEffect } from "react";


export default function useCountdown(seconds: number) {
    const [left, setLeft] = useState(() => seconds);

    useEffect(() => {
        if (seconds <= 0) return;

        const id = setInterval(() => {
            setLeft((v) => (v <= 1 ? 0 : v - 1));
        }, 1000);

        return () => clearInterval(id);
    }, [seconds]);

    return left;
}
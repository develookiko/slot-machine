import { useEffect, useState } from "react";
import { useSlotMachineStyles } from "./SlotMachine.style"

type SlotsType = {
    id: string,
    y: string,
    durationSeconds: number,
    items: {
        id: string,
        value: string, 
    }[]
}[]

export const SlotMachine = () => {
    const styles = useSlotMachineStyles();
    const [slots, setSlots] = useState<SlotsType>([]);
    const [slotCount, setSlotCount] = useState<number>(3);
    const [itemCount, setItemCount] = useState<number>(64);
    const [lineCount, setLineCount] = useState<number>(1);
    const [spinning, setSpinning] = useState<boolean>(false);

    const getRandomItem = () => { return ["🍎", "👑", "🏹", "🎳", "🔥", "🍕"][(Math.floor(Math.random() * 6))]; }

    const generateSlots = (slotCount: number, itemCount: number, slots: SlotsType = []) => {
        const generatedSlots: SlotsType = []
        for (let slot = 0; slot < slotCount; slot++) {
            generatedSlots.push({
                id: String(crypto.randomUUID()),
                y: `${itemCount * 5 - 4 * 4 + 1}rem`,
                durationSeconds: 0,
                items: [],
            });
            for (let item = 0; item < itemCount; item++) {
                const oldSlots = slots[slot]?.items;
                if (oldSlots && item < 3 && oldSlots.length >= 3) {
                    generatedSlots[slot].items.push(oldSlots[oldSlots.length - 3 + item]);
                    continue;
                }
                const randomItem = getRandomItem();
                generatedSlots[slot].items.push({ id: String(crypto.randomUUID()), value: randomItem, });
            }
        }
        setSlots(generatedSlots);
    }

    const checkWin = () => {
        let win = false;
        for (let line = 0; line < lineCount; line++) {
            const lineItems = slots.map(slot => slot.items[slot.items.length - 2 - line] || { value: "" });
            if (lineItems.every(item => item.value === lineItems[0].value)) {
                win = true;
                break;
            }
        }
        if (win) { alert("Win"); }
    }

    const spinReset = () => {
        slots.forEach((row) => { row.durationSeconds = 0; });
        generateSlots(slotCount, itemCount, slots);
        setSpinning(false);
    }

    const spin = () => {
        setSpinning(true);
        let maxDuration = 0;
        slots.forEach((row, index) => {
            row.y = "0";
            row.durationSeconds = 2 + index;
            if (row.durationSeconds > maxDuration) { maxDuration = row.durationSeconds }
        });
        setSlots([...slots]);
        setTimeout(() => {
            checkWin();
            spinReset();
        }, maxDuration * 1000);
    }

    useEffect(() => { generateSlots(slotCount, itemCount); }, [])
    useEffect(() => { generateSlots(slotCount, itemCount); }, [slotCount, itemCount]);

    return <section css={styles.root}>
        <h1>Slot Machine - СЛОТЫ!!!</h1>
        <div css={styles.rowsContainer}>
            {
                slots.map((slot) =>
                    <div css={styles.slotsContainer}
                        key={slot.id}
                        style={{
                            transform: `translateY(${slot.y})`,
                            transitionDuration: `${slot.durationSeconds}s`
                        }}>
                        {
                            slot.items.map((item) =>
                                <div key={item.id} css={styles.slotContainer}>{item.value}</div>
                            )
                        }
                    </div>
                )
            }
        </div>
        <button onClick={() => !spinning && spin()}>ВРАЩАТЬ</button>
        <div css={styles.settingsContainer}>
            <label><span>Число барабанов ({slotCount})</span><input type="range" min="2" max="9" value={slotCount} onChange={(event) => !spinning && setSlotCount(parseInt(event.target.value))}></input></label>
            <label><span>Число играющих линий ({lineCount})</span><input type="range" min="1" max="4" value={lineCount} onChange={(event) => !spinning && setLineCount(parseInt(event.target.value))}></input></label>
            <label><span>Разнообразие ({itemCount})</span><input type="range" min="16" max="256" value={itemCount} onChange={(event) => !spinning && setItemCount(parseInt(event.target.value))}></input></label>
        </div>
    </section>
}

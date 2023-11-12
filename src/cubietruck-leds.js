import { readFile, writeFile } from 'fs/promises';

const getLedValueFileName = (color) => `/sys/class/leds/cubietruck:${color}:usr/brightness`;

export const LED_CONSTANTS = {
    LED_OFF_VALUE: '0',
    LED_ON_VALUE:  '1',
    LED_COLOR: {
        BLUE: 'blue',
        ORANGE: 'orange',
        WHITE: 'white',
        GREEN: 'green'
    }
};

export const allLedColors = [
    LED_CONSTANTS.LED_COLOR.BLUE, 
    LED_CONSTANTS.LED_COLOR.ORANGE, 
    LED_CONSTANTS.LED_COLOR.WHITE, 
    LED_CONSTANTS.LED_COLOR.GREEN
];

export const getLed = async (color) => {
    const fileName = getLedValueFileName(color);
    const data = await readFile(fileName, 'utf8');
    const value = data && data.length > 0 && data[0] === LED_CONSTANTS.LED_ON_VALUE;
    return value;
};

export const setLed = async (color, value) => {
    const fileName = getLedValueFileName(color);
    const data = value ? LED_CONSTANTS.LED_ON_VALUE : LED_CONSTANTS.LED_OFF_VALUE;
    return await writeFile(fileName, data);
};

export const toggleLed = async (color) => {
    const oldValue = await getLed(color);
    const value = !oldValue;
    return await setLed(color, value);
};

export const getAllLeds = async () =>
    await Promise.all(
        allLedColors.map(async (color) => { 
            const value = await getLed(color);
            return { color, value };
        })
    );

export const setAllLeds = async (value) =>
    await Promise.all(
        allLedColors.map(async (color) => 
            await setLed(color, value)
        )
    );

export const toggleAllLeds = async () => 
    await Promise.all(
        allLedColors.map(toggleLed)
    );

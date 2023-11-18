import { readFile, writeFile } from 'fs/promises';

const getLedValueFileName = (color) => `/sys/class/leds/cubietruck:${color}:usr/brightness`;

const LED_COLOR = {
    BLUE: 'blue',
    ORANGE: 'orange',
    WHITE: 'white',
    GREEN: 'green'
};

export const LED_CONSTANTS = {
    LED_OFF_VALUE: '0',
    LED_ON_VALUE:  '1',
    LED_COLOR,
    ALL_LED_COLORS: [
        LED_COLOR.BLUE, 
        LED_COLOR.ORANGE, 
        LED_COLOR.WHITE, 
        LED_COLOR.GREEN
    ]
};

const getLed = async (color) => {
    const fileName = getLedValueFileName(color);
    const data = await readFile(fileName, 'utf8');
    const value = data && data.length > 0 && data[0] === LED_CONSTANTS.LED_ON_VALUE;
    return value;
};

const setLed = async (color, value) => {
    const fileName = getLedValueFileName(color);
    const data = value ? LED_CONSTANTS.LED_ON_VALUE : LED_CONSTANTS.LED_OFF_VALUE;
    return await writeFile(fileName, data);
};

const toggleLed = async (color) => {
    const oldValue = await getLed(color);
    const newValue = !oldValue;
    return await setLed(color, newValue);
};

export const getLeds = async (colors) => 
    await Promise.all(
        await colors.reduce(async (acc, color) => {
            const value = await getLed(color);
            acc[color] = value;
            return acc;
        }, {})
    );

export const setLeds = async (colorToValueMap) => {
    const colorValueEntries = Object.entries(colorToValueMap);
    await Promise.all(
        await colorValueEntries
        .map(async ([color, value]) => 
            await setLed(color, value)
        )
    );
};

export const toggleLeds = async (colors) => 
    await Promise.all(
        await colors.map(toggleLed)
    );
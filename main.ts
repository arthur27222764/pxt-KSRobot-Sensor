//% color=#ff4b4b icon="\uf2db" block="KSRobot_Sensor"
namespace KSRobot_Sensor {

    let initialized = false;
    let Weight_Maopi =0;

    export enum DHT_type {
        //% blockId="DHT11" block="DHT11"
        DHT11,
        //% blockId="DHT22" block="DHT22"
        DHT22,
    }

    export enum DHT_State {
        //% blockId="Celsius" block="Celsius"
        Celsius,
        //% blockId="Fahrenheit" block="Fahrenheit"
        Fahrenheit,
        //% blockId="Humidity" block="Humidity"
        Humidity,
    }

    export enum SOIL_State {
        //% blockId="Celsius" block="Celsius"
        Celsius,
        //% blockId="Humidity" block="Humidity"
        Humidity,
    }


    //% blockId="KSRobot_dht11" block="DHT set %dht_type pin %dataPin|get %dht_state"
    export function dht_readdata(dht_type: DHT_type, dataPin: DigitalPin, dht_state: DHT_State): number {
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        let checksum: number = 0
        let checksumTmp: number = 0
        let _temperature: number = -999.0
        let _humidity: number = -999.0
        let _readSuccessful: boolean = false

        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)

        pins.digitalWritePin(dataPin, 0)
        basic.pause(18)
        pins.setPull(dataPin, PinPullMode.PullUp);
        pins.digitalWritePin(dataPin, 1)
        control.waitMicros(40)
        pins.digitalReadPin(dataPin)

        if (pins.digitalReadPin(dataPin) != 1) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            while (pins.digitalReadPin(dataPin) == 1);
            //read data (5 bytes)
            for (let index = 0; index < 40; index++) {
                while (pins.digitalReadPin(dataPin) == 1);
                while (pins.digitalReadPin(dataPin) == 0);
                control.waitMicros(28)
                //if sensor still pull up data pin after 28 us it means 1, otherwise 0
                if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
            }

            //convert byte number array to integer
            for (let index = 0; index < 5; index++)
                for (let index2 = 0; index2 < 8; index2++)
                    if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

            //verify checksum
            checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
            checksum = resultArray[4]
            if (checksumTmp >= 512) checksumTmp -= 512
            if (checksumTmp >= 256) checksumTmp -= 256
            if (checksum == checksumTmp) _readSuccessful = true

            //read data if checksum ok
            if (_readSuccessful) {
                if (dht_type == DHT_type.DHT11) {
                    //DHT11
                    _humidity = resultArray[0] + resultArray[1] / 100
                    _temperature = resultArray[2] + resultArray[3] / 100
                } else {
                    //DHT22
                    let temp_sign: number = 1
                    if (resultArray[2] >= 128) {
                        resultArray[2] -= 128
                        temp_sign = -1
                    }
                    _humidity = (resultArray[0] * 256 + resultArray[1]) / 10
                    _temperature = (resultArray[2] * 256 + resultArray[3]) / 10 * temp_sign
                }
                switch (dht_state) {
                    case DHT_State.Celsius:

                        return _temperature;
                        break;

                    case DHT_State.Fahrenheit:

                        return _temperature = _temperature * 9 / 5 + 32;
                        break;

                    case DHT_State.Humidity:

                        return _humidity;
                        break;

                }
            }

        }

        return -99;

    }


    //% blockId="KSRobot_soil" block="Soil pin %dataPin|get %soil_state"
    export function soil_readdata(dataPin: DigitalPin, soil_state: SOIL_State): number {
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        let checksum: number = 0
        let checksumTmp: number = 0
        let _temperature: number = -999.0
        let _humidity: number = -999.0
        let _readSuccessful: boolean = false

        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)

        pins.digitalWritePin(dataPin, 0)
        basic.pause(18)
        pins.setPull(dataPin, PinPullMode.PullUp);
        pins.digitalWritePin(dataPin, 1)
        control.waitMicros(40)
        pins.digitalReadPin(dataPin)

        if (pins.digitalReadPin(dataPin) != 1) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            while (pins.digitalReadPin(dataPin) == 1);
            //read data (5 bytes)
            for (let index = 0; index < 40; index++) {
                while (pins.digitalReadPin(dataPin) == 1);
                while (pins.digitalReadPin(dataPin) == 0);
                control.waitMicros(28)
                //if sensor still pull up data pin after 28 us it means 1, otherwise 0
                if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
            }

            //convert byte number array to integer
            for (let index = 0; index < 5; index++)
                for (let index2 = 0; index2 < 8; index2++)
                    if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

            //verify checksum
            checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
            checksum = resultArray[4]
            if (checksumTmp >= 512) checksumTmp -= 512
            if (checksumTmp >= 256) checksumTmp -= 256
            if (checksum == checksumTmp) _readSuccessful = true

            //read data if checksum ok
            if (_readSuccessful) {

                _humidity = resultArray[0] + resultArray[1] / 100
                _temperature = resultArray[2] + resultArray[3] / 100

                switch (soil_state) {
                    case SOIL_State.Celsius:

                        return _temperature;
                        break;

                    case SOIL_State.Humidity:

                        return _humidity;
                        break;

                }
            }

        }

        return -99;

    }

    //% blockId="KSRobot_temt6000" block="TEMT6000(Lux) set pin %dataPin"
    export function temt6000(dataPin: AnalogPin): number {
        let temp = pins.analogReadPin(dataPin)
        return (Math.round(temp * 4 / 1024 / 10000 * 1000000 * 4))
    }


    function HX711_Read(sck_pin: DigitalPin, data_pin: DigitalPin): number {

        // gain 128


        //digitalWrite(HX711_DT, HIGH);
        //delayMicroseconds(1);
        pins.digitalWritePin(data_pin, 1)
        control.waitMicros(1)

        //digitalWrite(HX711_SCK, LOW);
        //delayMicroseconds(1);
        pins.digitalWritePin(sck_pin, 0)
        control.waitMicros(1)

        //count = 0;
        let count = 0;

        //while (digitalRead(HX711_DT));
        while (pins.digitalReadPin(data_pin));

        //for (i = 0; i < 24; i++) {
        for (let i = 0; i < 24; i++) {
            //digitalWrite(HX711_SCK, HIGH);
            //delayMicroseconds(1);
            pins.digitalWritePin(sck_pin, 1)
            control.waitMicros(1)

            //count = count << 1;
            count = count * 2;

            //digitalWrite(HX711_SCK, LOW);
            //delayMicroseconds(1);
            pins.digitalWritePin(sck_pin, 0)
            control.waitMicros(1)

            //if (digitalRead(HX711_DT))
            //    count++;

            if (pins.digitalReadPin(data_pin))
                count += 1

        }


        //digitalWrite(HX711_SCK, HIGH);
        //count ^= 0x800000;  
        //delayMicroseconds(1);
        pins.digitalWritePin(sck_pin, 1)
        count = count ^ 0x800000;
        control.waitMicros(1)
        //digitalWrite(HX711_SCK, LOW);
        //delayMicroseconds(1);
        pins.digitalWritePin(sck_pin, 0)
        control.waitMicros(1)


        return (count);
    }


    //% blockId="KSRobot_load_cell" block="Load Cell(g) set ClockPin %sck_pin |DataPin %data_pin "
    export function load_cell(sck_pin: DigitalPin, data_pin: DigitalPin): number {


        let Weight = 0;
        let HX711_Buffer =0;
        
        

        //Get_Maopi()
        if (!initialized) {
            HX711_Buffer = HX711_Read(sck_pin, data_pin);
            Weight_Maopi = HX711_Buffer / 100;
            basic.pause(1000)
            HX711_Buffer = HX711_Read(sck_pin, data_pin);
            Weight_Maopi = HX711_Buffer / 100;

            initialized = true;

        }

        //Get_Weight()
        HX711_Buffer = HX711_Read(sck_pin, data_pin);
        HX711_Buffer = HX711_Buffer / 100;

        let Weight_Shiwu = HX711_Buffer;
        Weight_Shiwu = Weight_Shiwu - Weight_Maopi;
        Weight = Math.round(Weight_Shiwu / 2.14);


        return Weight
        
    }

    //% blockId="KSRobot_wind_speed" block="Wind Sensor(m/s) set pin %dataPin"
    export function wind_speed(dataPin: AnalogPin): number {
        let temp = pins.analogReadPin(dataPin)
        return (temp * 4 / 1024 * 26)
    }
    //% blockId="KSRobot_wind_direction" block="Wind Sensor set pin %dataPin"
    export function wind_direction(dataPin: AnalogPin): number {
        let temp = pins.analogReadPin(dataPin)
        return (temp * 4 / 1024 * 26)
    }
    //% blockId="KSRobot_flow_sensor" block="Flow Sensor set pin %dataPin"
    export function flow_sensor(dataPin: AnalogPin): number {
        let temp = pins.analogReadPin(dataPin)
        return (temp * 4 / 1024 * 26)
    }
    //% blockId="KSRobot_dissolved_oxygen" block=" Dissolved oxygen set pin %dataPin"
    export function dissolved_oxygen(dataPin: AnalogPin): number {
        let temp = pins.analogReadPin(dataPin)
        return (temp * 4 / 1024 * 26)
    }

    //% blockId="KSRobot_CO2_readdata" block="CO2 TXD %txd| RXD %rxd"
    export function CO2_readdata(txd: SerialPin, rxd: SerialPin): number {

        return 0
    }




}

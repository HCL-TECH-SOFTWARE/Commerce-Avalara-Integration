/*
 *==================================================
 * Licensed Materials - Property of HCL Technologies
 *
 * HCL Commerce
 *
 * (C) Copyright HCL Technologies Limited 2020
 *
 *==================================================
 */
//Standard libraries
import { Dialog, DialogContent, FormControlLabel, FormLabel, RadioGroup, Button, Radio } from "@material-ui/core";
import Axios, { Canceler } from "axios";
import React, { useEffect, useState } from "react";
import addressService from "../../_foundation/apis/address.service";
//Custom libraries


interface AddressValidatorProps {

    addressData?: object;
    updateAddress?: Function;
}

/**
 * Address validator display component
 * displays list of addresses
 * @param props
 */
const AddressValidator: React.FC<AddressValidatorProps> = (props: any) => {
    const addressData = props.addressData;
    const [addressOption, setAddressOption] = useState('original');
    const [openValue, setOpenValue] = useState(false);
    const [validatedAddresses, setValidatedAddresses] = useState<any>([]);
    const [updatedAddress, setUpdatedAddress] = useState(props.addressData);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        //make call to validate address API=
        if (addressData.country) {
            let finalAdd = addressData;
            addressService.validateAddress(finalAdd).then(response => {
                if (response.data.avaResponse) {
                    console.log('response from address validator' + response);
                    const { validatedAddresses } = response.data.avaResponse;
                    setErrorMessage(response.data.avaResponse.messages ? response.data.avaResponse.messages[0].details : '');
                    setValidatedAddresses(validatedAddresses);
                    setOpenValue(true);
                } else {
                    //hide the dialog box
                    cancelValidation();
                }

            });
        }

    }, [addressData]);

    const cancelValidation = () => {
        setOpenValue(false);
        props.updateAddress(addressData);
    }

    const CancelToken = Axios.CancelToken;
    let cancels: Canceler[] = [];

    const payloadBase: any = {
        cancelToken: new CancelToken(function executor(c) {
            cancels.push(c);
        }),
    };

    const payload = {
        ...payloadBase,
    };

    const saveVaidatedAddress = () => {
        setOpenValue(false);
        props.updateAddress(updatedAddress);

    };
    const changeAddress = (arr, event) => {
        var index = event.target.value.split('_')[1];
        index ? setAddressOption('suggested_' + index) : setAddressOption('original');
        if (index && arr[index]) {
            //it means there is a selection and we need to update the address 

            const { addressType, city, country, line1, line2, line3, postalCode, region } = arr[index];
            setUpdatedAddress({ ...updatedAddress, 'addressLine1': line1, 'city': city, 'zipCode': postalCode, 'state': region, 'country': country, 'addressLine2': line2 });

        } else {
            // we have to keep the orinal address
            setUpdatedAddress(addressData);
        }

    }

    return (
        <Dialog maxWidth="md"
            className="barcode-dialog"
            onClose={() => { setOpenValue(false) }}
            aria-labelledby="simple-dialog-title"
            disableBackdropClick={true}
            open={openValue}>
            <DialogContent>
                <div>
                    <h2 style={{ color: "purple" }}>We Have Validated Your Address.</h2>
                    <RadioGroup row aria-label="position" name="position1" value={addressOption} onChange={(event) => changeAddress(validatedAddresses, event)}>

                        <FormLabel component="legend" style={{ display: 'block', width: '100%' }}><h4>Original Address:</h4></FormLabel>
                        <FormControlLabel value="original" control={<Radio color="primary" />} label={addressData.addressLine1 + " " + addressData.addressLine2 + " " + addressData.city + " " + addressData.state.toUpperCase() + " " + addressData.zipCode + " " + addressData.country.toUpperCase()} />
                        <FormLabel component="legend" style={{ display: 'block', width: '100%' }} ><h4>Suggested address:</h4></FormLabel>
                        {validatedAddresses.map((item, index) => {
                            return <FormControlLabel value={'suggested_' + index} control={<Radio color="primary" />} label={item.line1 + " " + item.line2 + " " + item.city + " " + item.region + " " + item.postalCode + " " + item.country} />;

                        })}
                    </RadioGroup>
                </div>
                <div>
                    <h3>{errorMessage}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Button variant="contained" style={{ marginRight: 10, backgroundColor: "red", color: "white" }} onClick={() => cancelValidation()}>
                        Cancel
                    </Button>
                    <Button variant="contained" style={{ backgroundColor: "green", color: "white" }} onClick={() => saveVaidatedAddress()}>
                        Continue
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export { AddressValidator };

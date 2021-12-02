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
import React, { Fragment, useEffect, useContext, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Axios, { Canceler } from "axios";
import { useTranslation } from "react-i18next";

//Foundation libraries
import { useSite } from "../../../_foundation/hooks/useSite";
import personContactService from "../../../_foundation/apis/transaction/personContact.service";

//Redux
import { addressDetailsSelector } from "../../../redux/selectors/account";
import { GET_ADDRESS_DETAIL_ACTION } from "../../../redux/actions/account";
import * as successActions from "../../../redux/actions/success";

//Custom libraries
import {
  ADDRESS_TYPE_MAP,
  ADDRESSLINE1,
  ADDRESSLINE2,
  EMPTY_STRING,
  PHONE1,
  ORG_ADDRESS_DETAILS,
  ORG_ADDRESS,
  ADDRESS_LINE,
} from "../../../constants/common";
import { EDIT_ADDRESS } from "../../../constants/routes";
import * as ROUTES from "../../../constants/routes";
import AddressContext from "../../pages/checkout/address/AddressContext";
import addressUtil from "../../../utils/addressUtil";
//UI
import { StyledTypography, StyledCard } from "../../StyledUI";
import addressService from "../../../_foundation/apis/address.service";
import { Button, Dialog, DialogContent, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core";
import { json } from "msw/lib/types/context";
import { CheckoutPageType } from "../../pages/checkout/address/Address";
import * as accountActions from "../../../redux/actions/account";
import * as orderActions from "../../../redux/actions/order";
import { AddressValidator } from "../../address/AddressValidator";
interface AddressCardProps {
  addressId: string;
  nickName?: string;
  addressData?: any;
  actions?: any[];
  type?: boolean;
  setSelectedAddressId?: Function; //selected address setter
  selectedAddressId?: string;
  readOnly?: boolean;
  page?: string;
  validate?: string;
}

/**
 * Address card display component
 * displays the details of a single address
 * @param props
 */
const AddressCard: React.FC<AddressCardProps> = (props: any) => {
  console.log(props + "&&&&&&&&&");
  const addressId = props.addressId ? props.addressId : "";
  const nickName = props.nickName ? props.nickName : "";
  const actions = props.actions;
  const type = props.type ? props.type : false;
  const readOnly = props.readOnly ? props.readOnly : false;
  const selectedAddressId = props.selectedAddressId
    ? props.selectedAddressId
    : "";
  const setSelectedAddressId = props.setSelectedAddressId
    ? props.setSelectedAddressId
    : null;
  const isSelected = selectedAddressId === addressId;
  const addressDetails = useSelector(addressDetailsSelector);
  const addressContext = useContext(AddressContext);
  const orgAddressDetails = addressContext[ORG_ADDRESS_DETAILS];
  const addressData = props.addressData
    ? buildAddressData(props.addressData)
    : getAddress();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let editAddressDetails: any;
  const { mySite } = useSite();
  const TOGGLE_EDIT_ADDRESS = "toggleEditAddress";
  const SET_EDIT_ADDRESS_FORM_DATA = "setEditAddressFormData";
  const page = props.page ? props.page : "";
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

  useEffect(() => {
    if (mySite && addressDetails === null) {
      let payload = {
        ...payloadBase,
      };
      dispatch(GET_ADDRESS_DETAIL_ACTION(payload));
    }
  }, [mySite, addressData, props.validate]);

  function deleteAddress(nickName: string) {
    const parameters: any = {
      nickName: nickName,
    };
    personContactService.deletePersonContact(parameters).then((res) => {
      dispatch(GET_ADDRESS_DETAIL_ACTION(payload));
      const successMessage = {
        key: "success-message.DELETE_ADDRESS_SUCCESS",
        messageParameters: {
          ["0"]: nickName,
        },
      };
      dispatch(successActions.HANDLE_SUCCESS_MESSAGE_ACTION(successMessage));
    });
  }
  const EDIT_SUCCESS_MSG = "success-message.EDIT_ADDRESS_SUCCESS";
  const saveVaidatedAddress = (fData?: any) => {
    let updatedAddressData = addressUtil.removeLeadingTrailingWhiteSpace(
      fData
    );
    updatedAddressData[ADDRESS_LINE] = [
      updatedAddressData[ADDRESSLINE1],
      updatedAddressData[ADDRESSLINE2],
    ];
    console.log(updatedAddressData, "-----adresssssssss");
    let requestParams = {
      nickName: updatedAddressData.nickName,
      body: updatedAddressData,
      ...payloadBase,
    };
    personContactService
      .updatePersonContact(requestParams)
      .then((res) => res.data)
      .then((addressData) => {
        setSelectedAddressId(updatedAddress.addressId);
        setRvalue(false);

        if (addressData.addressId) {
          dispatch(accountActions.GET_ADDRESS_DETAIL_ACTION(payload));
          if (page === CheckoutPageType.SHIPPING) {
            dispatch(orderActions.GET_SHIPINFO_ACTION(payload));
          }
          if (page === CheckoutPageType.PAYMENT) {
            dispatch(orderActions.GET_PAYMETHODS_ACTION(payload));
          }
          const successMessage = {
            key: EDIT_SUCCESS_MSG,
            messageParameters: {
              ["0"]: updatedAddressData.nickName,
            },
          };
          dispatch(
            successActions.HANDLE_SUCCESS_MESSAGE_ACTION(successMessage)
          );
          setSelectedAddressId(addressData.addressId);
          // setAddressFormData(addressFormDataInit);
          //toggleEditAddress(false);
        }
      })
      .catch((e) => {
        console.log("Could not update the address", e);
      });
  };

  function getAddress() {
    let finalAddressData: any = {};
    if (addressDetails && addressId !== "") {
      const contactMap = addressDetails.contactMap;
      if (
        addressDetails.addressId === addressId ||
        addressDetails.nickName === nickName
      ) {
        finalAddressData = addressDetails;
      } else if (contactMap && contactMap[addressId]) {
        finalAddressData = contactMap[addressId];
      } else if (nickName !== "") {
        for (let key in contactMap) {
          if (contactMap[key].nickName == nickName) {
            finalAddressData = contactMap[key];
            break;
          }
        }
      }
    }
    if (
      orgAddressDetails &&
      orgAddressDetails.contactInfo &&
      orgAddressDetails.addressBook &&
      addressId !== EMPTY_STRING
    ) {
      if (
        addressId === orgAddressDetails.contactInfo.addressId ||
        nickName === orgAddressDetails.contactInfo.nickName
      ) {
        let orgAddress: any = {};
        Object.assign(orgAddress, orgAddressDetails.contactInfo);
        orgAddress[ADDRESS_LINE] = [
          orgAddress.address1,
          orgAddress.address2,
          orgAddress.address3,
        ];
        orgAddress[ORG_ADDRESS] = true;
        finalAddressData = orgAddress;
      } else {
        for (let orgAddress of orgAddressDetails.addressBook) {
          if (
            addressId === orgAddress.addressId ||
            nickName === orgAddress.nickName
          ) {
            let address: any = {};
            Object.assign(address, orgAddress);
            address[ADDRESS_LINE] = [
              address.address1,
              address.address2,
              address.address3,
            ];
            address[ORG_ADDRESS] = true;
            finalAddressData = address;
            break;
          }
        }
      }
    }
    return buildAddressData(finalAddressData);
  }

  function buildAddressData(address: any) {
    let finalAddressData: any = { ...address };

    let fullNameString: string = "";
    if (
      finalAddressData.firstName !== undefined &&
      finalAddressData.firstName !== ""
    ) {
      fullNameString = finalAddressData.firstName;
    }
    if (
      finalAddressData.lastName !== undefined &&
      finalAddressData.lastName !== ""
    ) {
      if (fullNameString !== "") {
        fullNameString += " ";
      }
      fullNameString += finalAddressData.lastName;
      finalAddressData = {
        ...finalAddressData,
        fullNameString: fullNameString,
      };
    }

    let cityStateZipList: string[] = [];
    if (finalAddressData.city !== undefined && finalAddressData.city !== "") {
      cityStateZipList.push(finalAddressData.city);
    }
    if (finalAddressData.state !== undefined && finalAddressData.state !== "") {
      cityStateZipList.push(finalAddressData.state);
    }
    if (
      finalAddressData.zipCode !== undefined &&
      finalAddressData.zipCode !== ""
    ) {
      cityStateZipList.push(finalAddressData.zipCode);
    }
    if (cityStateZipList.length > 0) {
      const cityStateZipString = cityStateZipList.join(", ");
      finalAddressData = {
        ...finalAddressData,
        cityStateZipString: cityStateZipString,
      };
    }
    return finalAddressData;
  }
  const [addressData1, setAddressData1] = useState<any>(null);
  const [compAddressFormData, setCompAddressFormData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState<any>(false);
  /**
   * code for address validation when user clicks use this address
   */
  const prepareAddressData = (filteredAddressDetails: any) => {
    let addressDataObj = { ...filteredAddressDetails };
    if (
      filteredAddressDetails.addressLine &&
      filteredAddressDetails.addressLine.length > 2
    ) {
      addressDataObj[ADDRESSLINE1] = filteredAddressDetails.addressLine[0];
      addressDataObj[ADDRESSLINE2] = filteredAddressDetails.addressLine[1];
      addressDataObj = addressUtil.removeIgnorableAddressFormFields(
        addressDataObj
      );
    }
    return addressDataObj;
  };
  const updateAddressFormData = (fData: any) => {
    saveVaidatedAddress(fData);
    setShowDialog(false);
  }
  const openValidateAddressPopup = () => {
    setShowDialog(true);
  };
  const [rvalue, setRvalue] = useState(true);
  const [updatedAddress, setUpdatedAddress] = useState(addressData);
  const [addressOption, setAddressOption] = useState('original')
  const updateAddress = (arr, event) => {
    var index = event.target.value.split('_')[1];
    index ? setAddressOption('suggested_' + index) : setAddressOption('original');
    if (index && arr[index]) {
      //it means there is a selection and we need to update the address 

      const { addressType, city, country, line1, line2, line3, postalCode, region } = arr[index];
      let addressArray = [line1, line2, line3];
      // let cityStateZipString = [city,region,,postalCode].join(',');

      setUpdatedAddress({ ...updatedAddress, 'addressLine': addressArray, 'addressLine1': line1, 'city': city, 'zipCode': postalCode, 'state': region, 'country': country, 'addressLine2': line2, 'addressLine3': line3 });

    } else {
      // we have to keep the orinal address
      setUpdatedAddress(addressData);
    }

  }
  const openAddressValidatorDialog = (response) => {
    const { validatedAddresses } = response.data.avaResponse;
    return <Dialog maxWidth="md"
      className="barcode-dialog"
      onClose={() => { setAddressData1(null) }}
      aria-labelledby="simple-dialog-title"
      open={rvalue}>
      <DialogContent>
        <div>
          <h2 style={{ color: "purple" }}>We Have Validated Your Address.</h2>
          <RadioGroup row aria-label="position" name="position1" value={addressOption} onChange={(event) => updateAddress(validatedAddresses, event)}>

            <FormLabel component="legend" style={{ display: 'block', width: '100%' }}><h4>Original Address:</h4></FormLabel>
            <FormControlLabel value="original" control={<Radio color="primary" />} label={addressData.addressLine + " " + addressData.cityStateZipString + " " + addressData.country} />
            <FormLabel component="legend" style={{ display: 'block', width: '100%' }} ><h4>Suggested address:</h4></FormLabel>
            {validatedAddresses.map((item, index) => {
              return <FormControlLabel value={'suggested_' + index} control={<Radio color="primary" />} label={item.line1 + " " + item.city + " " + item.region + " " + item.postalCode + " " + item.country} />;

            })}
          </RadioGroup>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button variant="contained" style={{ marginRight: 10, backgroundColor: "red", color: "white" }} onClick={() => setRvalue(false)}>
            Cancel
    </Button>
          <Button variant="contained" style={{ backgroundColor: "green", color: "white" }} onClick={() => saveVaidatedAddress()}>
            Continue
    </Button>

        </div>
      </DialogContent>
    </Dialog>
  };
  const handleEditButton = () => {
    addressContext[TOGGLE_EDIT_ADDRESS](true);
    editAddressDetails = { ...addressData };
    setAndCleanAddressData(addressData);
    if (!addressData.phone1) {
      editAddressDetails[PHONE1] = EMPTY_STRING;
    }
    addressContext[SET_EDIT_ADDRESS_FORM_DATA](editAddressDetails);
  };

  const setAndCleanAddressData = (filteredAddressDetails: any) => {
    if (
      filteredAddressDetails.addressLine &&
      filteredAddressDetails.addressLine.length > 2
    ) {
      editAddressDetails[ADDRESSLINE1] = filteredAddressDetails.addressLine[0];
      editAddressDetails[ADDRESSLINE2] = filteredAddressDetails.addressLine[1];
      editAddressDetails = addressUtil.removeIgnorableAddressFormFields(
        editAddressDetails
      );
    }
  };

  const headerComponent = (
    <>
      {addressData.nickName && (
        <StyledTypography variant="subtitle2" display="block" noWrap>
          {addressData.nickName}
        </StyledTypography>
      )}
      {type && addressData.addressType && (
        <StyledTypography variant="caption">
          {t(ADDRESS_TYPE_MAP.get(addressData.addressType))}
        </StyledTypography>
      )}
    </>
  );

  const contentComponent = (
    <>
      {addressData.fullNameString && (
        <StyledTypography variant="body1" display="block" noWrap>
          {addressData.fullNameString}
        </StyledTypography>
      )}
      {addressData.addressLine &&
        addressData.addressLine.map((line: string, index: number) => (
          <Fragment key={index}>
            {line && (
              <StyledTypography variant="body1" display="block" noWrap>
                {line}
              </StyledTypography>
            )}
          </Fragment>
        ))}

      {addressData.cityStateZipString && (
        <StyledTypography variant="body1" display="block" noWrap>
          {addressData.cityStateZipString}
        </StyledTypography>
      )}

      {addressData.country && (
        <StyledTypography variant="body1" display="block" noWrap>
          {addressData.country}
        </StyledTypography>
      )}

      {addressData.phone1 && (
        <StyledTypography variant="body1" display="block" noWrap>
          {addressData.phone1}
        </StyledTypography>
      )}

      {addressData.email1 && (
        <StyledTypography variant="body1" display="block" noWrap>
          {addressData.email1}
        </StyledTypography>
      )}
    </>
  );

  // Memoized function to get the address card action based on dependencies/conditons
  const cardActions = useMemo(() => getCardActions(), [
    actions,
    setSelectedAddressId,
    isSelected,
    addressData.orgAddress,
    addressId,
  ]);

  /**
   * Get the card actions for Address Card
   */
  function getCardActions() {
    if (actions) {
      return actions;
    } else if (setSelectedAddressId) {
      return getCardActionsForCheckout();
    } else {
      return getCardActionsForAddressBook();
    }
  }

  /**
   * Returns card action for checkout flow
   */
  function getCardActionsForCheckout() {
    const action: any[] = [];
    if (!isOrgAddress()) {
      action.push({
        text: t("AddressCard.EditButton"),
        handleClick: () => handleEditButton(),
      }
      );
    }
    if (!isSelected) {
      action.push({
        text: t("AddressCard.UseAddress"),
        // handleClick: () => setSelectedAddressId(addressData.addressId),
        handleClick: () => props.page === 'shipping' ? openValidateAddressPopup() : setSelectedAddressId(addressData.addressId),
      });
    }
    return action;
  }

  /**
   * if the address is organization address returns true else undefined
   */
  function isOrgAddress() {
    return addressData.orgAddress;
  }

  /**
   * Returns the adress card actions for AddressBook component
   */
  function getCardActionsForAddressBook() {
    return [
      {
        text: t("AddressCard.EditButton"),
        link: EDIT_ADDRESS + ROUTES.HOME + addressData.addressId,
      },
      {
        text: t("AddressCard.DeleteButton"),
        handleClick: () => deleteAddress(addressData.nickName),
        enableConfirmation: true,
      },
    ];
  }

  return readOnly ? (
    contentComponent
  ) : (
      <>
        <StyledCard
          className={`address-card ${isSelected ? "selected" : ""}`}
          headerProps={headerComponent}
          contentComponent={contentComponent}
          cardActions={cardActions}
          confirmLabel={t("AddressCard.Confirm")}
          cancelLabel={t("AddressCard.Cancel")}
        />
        {showDialog ? <AddressValidator addressData={prepareAddressData(addressData)} updateAddress={updateAddressFormData} /> : null}
      </>
    );
};

export { AddressCard };

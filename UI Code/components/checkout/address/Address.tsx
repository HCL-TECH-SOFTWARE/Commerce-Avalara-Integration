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
import React, { useState, useEffect } from "react";
import Axios, { Canceler } from "axios";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
//Foundation libraries
import personContactService from "../../../../_foundation/apis/transaction/personContact.service";
//Custom library
import {
  ADDRESS_SHIPPING_BILLING,
  ADDRESS_LINE,
  ADDRESSLINE1,
  ADDRESSLINE2,
  EMPTY_STRING,
  IS_NEW,
  STRING_TRUE,
} from "../../../../constants/common";
import { AddressForm } from "../../../widgets/address-form";
import { AddressList } from "../../../widgets/address-list";
import addressUtil from "../../../../utils/addressUtil";
import AddressContext from "./AddressContext";
//Redux
import * as accountActions from "../../../../redux/actions/account";
import * as successActions from "../../../../redux/actions/success";
import * as orderActions from "../../../../redux/actions/order";
//UI
import { Divider } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import ContactsIcon from "@material-ui/icons/Contacts";
import {
  StyledGrid,
  StyledIconLabel,
  StyledButton,
  StyledTypography,
} from "../../../StyledUI";
import { AddressValidator } from "../../../address/AddressValidator";

export enum CheckoutPageType {
  SHIPPING = "shipping",
  PAYMENT = "payment",
}
interface CheckoutAddressProps {
  usableAddresses: any[];
  page: CheckoutPageType;
  setSelectedAddressId: Function;
  selectedAddressId?: string;
  toggleCreateNewAddress: Function;
  createNewAddress: boolean;
  toggleEditAddress: Function;
  editAddress: boolean;
  [extraProps: string]: any;
}

const useCheckoutAddress = (editAddress: boolean) => {
  const { t } = useTranslation();
  const addressFormDataInit = {
    firstName: EMPTY_STRING,
    lastName: EMPTY_STRING,
    addressLine1: EMPTY_STRING,
    addressLine2: EMPTY_STRING,
    city: EMPTY_STRING,
    country: EMPTY_STRING,
    state: EMPTY_STRING,
    zipCode: EMPTY_STRING,
    phone1: EMPTY_STRING,
    nickName: EMPTY_STRING,
    email1: EMPTY_STRING,
    addressType: ADDRESS_SHIPPING_BILLING,
  };
  const [addressFormData, setAddressFormData] = useState<any>(
    addressFormDataInit
  );
  const [validateAddressId, setValidateAddressId] = useState<string>(
    ''
  );
  const [showDialog,setShowDialog] = useState<boolean>(false);
  
  const canContinue = () => {
    if (editAddress) {
      return addressUtil.validateAddressForm(addressFormData, true);
    }
    return addressUtil.validateAddressForm(addressFormData);
  };
  return {
    addressFormData,
    setAddressFormData,
    canContinue,
    t,
    addressFormDataInit,
    validateAddressId,
    setValidateAddressId,
    showDialog,
    setShowDialog
  };
};

const CheckoutAddress: React.FC<CheckoutAddressProps> = ({
  usableAddresses,
  page,
  setSelectedAddressId,
  selectedAddressId,
  toggleCreateNewAddress: toggleCreateNew,
  createNewAddress: createNew,
  toggleEditAddress,
  editAddress,
  paymentChosen,
  ...props
}: CheckoutAddressProps) => {
  const dispatch = useDispatch();
  const isPersonalAddressAllowed: string = props.isPersonalAddressAllowed
    ? props.isPersonalAddressAllowed
    : STRING_TRUE;
  const orgAddressDetails: any = props.orgAddressDetails
    ? props.orgAddressDetails
    : {};
  const CancelToken = Axios.CancelToken;
  let cancels: Canceler[] = [];
  const EDIT_SUCCESS_MSG = "success-message.EDIT_ADDRESS_SUCCESS";
  const ADD_SUCCESS_MSG = "success-message.ADD_ADDRESS_SUCCESS";
  const {
    addressFormData,
    setAddressFormData,
    canContinue,
    t,
    addressFormDataInit,
    validateAddressId,
    setValidateAddressId,
    showDialog,
    setShowDialog
  } = useCheckoutAddress(editAddress);
  const payloadBase: any = {
    cancelToken: new CancelToken(function executor(c) {
      cancels.push(c);
    }),
  };
  const payload = {
    ...payloadBase,
  };
  
const validateAddress = ()=>{
  setShowDialog(true);
}
const updateAddressFormData=(fData:any)=>{
  //setAddressFormData(fData);
  submit(createNew,editAddress,fData);
  setShowDialog(false);
}
  const submit = (createNew: boolean, editAddress: boolean,fData?:any) => {
    // Add Address
    //call the component
    //setShow
    if (createNew) {
      //
      createAddress(fData);
    }
    // Edit Address
    if (editAddress) {
      //send formdata to the component
      //update it if there are 
      saveChanges(fData);
    }
  };

  const createAddress = (fData?:any) => {
    // remove leading and trailing white space from all form input fields.
    let newAddressData = addressUtil.removeLeadingTrailingWhiteSpace(
      fData?fData:addressFormData
    );
    newAddressData[ADDRESS_LINE] = [newAddressData[ADDRESSLINE1]];
    if (
      newAddressData[ADDRESSLINE2] &&
      newAddressData[ADDRESSLINE2].trim() !== EMPTY_STRING
    ) {
      newAddressData[ADDRESS_LINE].push(newAddressData[ADDRESSLINE2]);
    }
    newAddressData[IS_NEW] = STRING_TRUE;

    personContactService
      .addPersonContact({
        body: newAddressData,
        cancelToken: new CancelToken(function executor(c) {
          cancels.push(c);
        }),
      })
      .then((res) => res.data)
      .then((addressData) => {
        if (addressData.addressId) {
          dispatch(accountActions.GET_ADDRESS_DETAIL_ACTION(payload));
          if (page === CheckoutPageType.SHIPPING) {
            dispatch(orderActions.GET_SHIPINFO_ACTION(payload));
          } else if (page === CheckoutPageType.PAYMENT) {
            dispatch(orderActions.GET_PAYMETHODS_ACTION(payload));
          }
          const successMessage = {
            key: ADD_SUCCESS_MSG,
            messageParameters: {
              ["0"]: newAddressData.nickName,
            },
          };
          dispatch(
            successActions.HANDLE_SUCCESS_MESSAGE_ACTION(successMessage)
          );
          const addressIdFromResponse = addressData.addressId;
          setSelectedAddressId(addressIdFromResponse);
          setValidateAddressId(addressIdFromResponse);
          setAddressFormData(addressFormDataInit);
          toggleCreateNew(false);
        }
      });
  };

  const saveChanges = (fData?:any) => {
    // remove leading and trailing white space from all form input fields.
    let updatedAddressData = addressUtil.removeLeadingTrailingWhiteSpace(
      fData?fData:addressFormData
    );
    updatedAddressData[ADDRESS_LINE] = [
      updatedAddressData[ADDRESSLINE1],
      updatedAddressData[ADDRESSLINE2],
    ];
    let requestParams = {
      nickName: updatedAddressData.nickName,
      body: updatedAddressData,
      ...payloadBase,
    };
    personContactService
      .updatePersonContact(requestParams)
      .then((res) => res.data)
      .then((addressData) => {
        
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
          setAddressFormData(addressFormDataInit);
          setValidateAddressId(addressData.addressId);
          toggleEditAddress(false);
        }
      })
      .catch((e) => {
        console.log("Could not update the address", e);
      });
  };

  const cancelButtonAction = () => {
    toggleCreateNew(false);
    toggleEditAddress(false);
  };

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    });

    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, [createNew, editAddress]);

  return (
    <>
    {showDialog?<AddressValidator addressData={addressFormData} updateAddress={updateAddressFormData} />:null}
      <StyledGrid container spacing={2}>
        <StyledGrid
          item
          container
          direction="row"
          justify="space-between"
          alignItems="center">
          <StyledIconLabel
            icon={
              page === CheckoutPageType.SHIPPING ? (
                <HomeIcon color="primary" />
              ) : (
                <ContactsIcon color="primary" />
              )
            }
            label={
              page === CheckoutPageType.SHIPPING
                ? t("Shipping.Labels.ShippingAddress")
                : t("Payment.Labels.BillingAddress")
            }
          />
        </StyledGrid>
        {!paymentChosen && page === CheckoutPageType.PAYMENT && (
          <StyledGrid item xs={12}>
            {t("CheckoutAddress.Payment.ChooseFirst")}
          </StyledGrid>
        )}
        {(createNew || editAddress) && (
          <StyledGrid item xs={12} md={6} data-testid="checkout-address-form">
            <AddressForm
              cid="newAddress"
              setAddressFormData={setAddressFormData}
              addressFormData={addressFormData}
              edit={editAddress ? true : false}
            />
          </StyledGrid>
        )}
        {!createNew && !editAddress && (
          <>
            {((paymentChosen &&
              page === CheckoutPageType.PAYMENT &&
              isPersonalAddressAllowed === STRING_TRUE) ||
              (page === CheckoutPageType.SHIPPING &&
                isPersonalAddressAllowed === STRING_TRUE)) && (
              <StyledGrid item xs={12}>
                <StyledButton
                  data-testid="checkout-new-address-button"
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    toggleCreateNew(true);
                    setAddressFormData(addressFormDataInit);
                  }}>
                  {t("Shipping.Actions.CreateNew")}
                </StyledButton>
              </StyledGrid>
            )}
            {usableAddresses?.length > 0 && (
              <StyledGrid item xs={12}>
                <StyledTypography className="bottom-margin-2">
                  {t("Shipping.Msgs.UseSavedAddress")}
                </StyledTypography>
                <AddressContext.Provider
                  value={{
                    toggleEditAddress: toggleEditAddress,
                    setEditAddressFormData: setAddressFormData,
                    orgAddressDetails: orgAddressDetails,
                  }}>
                  <AddressList
                    cid="shipping"
                    addressList={usableAddresses}
                    setSelectedAddressId={setSelectedAddressId}
                    selectedAddressId={selectedAddressId || EMPTY_STRING}
                    page={page}
                    validate={validateAddressId}
                  />
                </AddressContext.Provider>
              </StyledGrid>
            )}
          </>
        )}
      </StyledGrid>
      <Divider className="top-margin-3 bottom-margin-2" />
      {(createNew || editAddress) && (
        <StyledGrid
          container
          justify="flex-end"
          spacing={2}
          className="checkout-actions">
          <StyledGrid item>
            <StyledButton size="small" onClick={cancelButtonAction}>
              {t("CheckoutAddress.Actions.Cancel")}
            </StyledButton>
          </StyledGrid>
          <StyledGrid item>
            <StyledButton
              color="primary"
              disabled={!canContinue()}
              onClick={() => validateAddress()}
              className="MuiButton-containedSecondary">
              {t("CheckoutAddress.Actions.Submit")}
            </StyledButton>
          </StyledGrid>
        </StyledGrid>
      )}
    </>
  );
};

export default CheckoutAddress;

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
import { useHistory } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import Axios, { Canceler } from "axios";
import { useTranslation } from "react-i18next";

//Redux
import { addressDetailsSelector } from "../../../redux/selectors/account";
import { GET_ADDRESS_DETAIL_ACTION } from "../../../redux/actions/account";
import * as successActions from "../../../redux/actions/success";

//Foundation libraries
import { useSite } from "../../../_foundation/hooks/useSite";
import personContactService from "../../../_foundation/apis/transaction/personContact.service";

//UI
import {
  StyledButton,
  StyledPaper,
  StyledGrid,
  StyledContainer,
  StyledLink,
  StyledBreadcrumbs,
  StyledTypography,
} from "../../StyledUI";
import { Divider } from "@material-ui/core";

//Custom libraries
import {
  ADDRESS_BOOK,
  ADDRESS_LINE,
  ADDRESS_SHIPPING,
  ADDRESSLINE1,
  ADDRESSLINE2,
  EMPTY_STRING,
  PHONE1,
} from "../../../constants/common";
import { AddressForm } from "../../widgets/address-form";
import addressUtil from "../../../utils/addressUtil";
import { ADDRESS_BOOK as ADDRESS_BOOK_ROUTE } from "../../../constants/routes";
import { AddressValidator } from "../../address/AddressValidator";

/**
 * Edit Address Component
 *
 * @param props/addressId
 */
const EditAddress = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { mySite } = useSite();
  const CancelToken = Axios.CancelToken;
  let cancels: Canceler[] = [];
  let editAddressDetails: any;
  const editAddressId = props.match.params.addressId;
  const history = useHistory();
  const addressDetails = useSelector(addressDetailsSelector);
  const payloadBase: any = {
    cancelToken: new CancelToken(function executor(c) {
      cancels.push(c);
    }),
  };
  const payload = {
    ...payloadBase,
  };
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
    addressType: ADDRESS_SHIPPING,
  };
  const EDIT_SUCCESS_MSG = "success-message.EDIT_ADDRESS_SUCCESS";
  const [editAddressFormData, setEditddressFormData] = useState<any>(
    addressFormDataInit
  );

  /**
   * Get the person edit address details based on the request parameter addressId
   * if we get the edit address details, then set it to Address Form data
   */
  const getAndSetEditAddressData = () => {
    if (
      editAddressId &&
      addressDetails &&
      addressDetails.contactList.length !== 0
    ) {
      const filteredAddressDetails = addressDetails.contactList.filter(
        (contact) => contact.addressId === editAddressId
      )[0];

      if (filteredAddressDetails) {
        editAddressDetails = { ...filteredAddressDetails };
        setAndRemoveAddressLine(filteredAddressDetails);
        if (!filteredAddressDetails.phone1) {
          editAddressDetails[PHONE1] = EMPTY_STRING;
        }
        setEditddressFormData(editAddressDetails);
      }
    }
  };

  /**
   * Get Address line 1 and Address line 2 from addressLine array
   * Remove addressId and addressLine from editAddressDetails, since it is
   * not used in AddressForm
   */
  const setAndRemoveAddressLine = (filteredAddressDetails: any) => {
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

  /**
   * Form validation function
   * Return true when all mandatory field has been entered
   * else false
   */
  const canSaveChanges = (): boolean => {
    return addressUtil.validateAddressForm(editAddressFormData, true);
  };

  /**
   * It will save and update the address by calling updatePersonContact method of
   * personContactService. If update is successfull, GET_ADDRESS_DETAIL_ACTION redux action
   * and HANDLE_SUCCESS_MESSAGE_ACTION redux action will be dispatched and redirect to
   * AddressList view.
   */
  const saveChanges = (fData?:any) => {
    // remove leading and trailing white space from all form input fields.
    let updatedAddressData = addressUtil.removeLeadingTrailingWhiteSpace(
      fData?fData:editAddressFormData
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
          dispatch(GET_ADDRESS_DETAIL_ACTION(payload));
          const successMessage = {
            key: EDIT_SUCCESS_MSG,
            messageParameters: {
              ["0"]: updatedAddressData.nickName,
            },
          };
          dispatch(
            successActions.HANDLE_SUCCESS_MESSAGE_ACTION(successMessage)
          );
        }
      })
      .catch((e) => {
        console.log("Could not update the address", e);
      });
    history.push(ADDRESS_BOOK_ROUTE);
  };

  useEffect(() => {
    if (mySite && addressDetails == null) {
      dispatch(GET_ADDRESS_DETAIL_ACTION(payload));
    }
    if (addressDetails !== null) {
      getAndSetEditAddressData();
    }
    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, [mySite, addressDetails]);
   /**
   * code for address verification
   */
  const [showDialog,setShowDialog] = useState<boolean>(false);
  const validateAddress = ()=>{
    setShowDialog(true);
  }
  const updateAddressFormData=(fData:any)=>{
    saveChanges(fData);
    setShowDialog(false);
  }

  return (
    <>
    {showDialog?<AddressValidator addressData={editAddressFormData} updateAddress={updateAddressFormData} />:null}
    <StyledContainer cid="edit-address">
      <StyledBreadcrumbs className="top-padding-6 vertical-padding-3">
        <StyledLink to={ADDRESS_BOOK_ROUTE}>
          <StyledTypography variant="h4">
            {t("AddressBook.Title")}
          </StyledTypography>
        </StyledLink>
        <span>
          <StyledTypography variant="h4">
            {t("AddressBook.EditAddress")}
          </StyledTypography>
        </span>
      </StyledBreadcrumbs>
      <StyledGrid container spacing={3}>
        <StyledPaper className="horizontal-padding-3 vertical-padding-3">
          <StyledGrid item xs={12} md={6}>
            <AddressForm
              cid="newAddress"
              setAddressFormData={setEditddressFormData}
              addressFormData={editAddressFormData}
              page={ADDRESS_BOOK}
              edit={true}
            />
          </StyledGrid>
          <Divider className="top-margin-2 bottom-margin-2" />
          <StyledGrid item xs={12}>
            <StyledLink to={ADDRESS_BOOK_ROUTE}>
              <StyledButton size="small" color="secondary">
                {t("AddressBook.Cancel")}
              </StyledButton>
            </StyledLink>
            <StyledButton
              color="primary"
              size="small"
              style={{ float: "right" }}
              disabled={!canSaveChanges()}
              onClick={()=>validateAddress()}>
              {t("AddressBook.SaveChanges")}
            </StyledButton>
          </StyledGrid>
        </StyledPaper>
      </StyledGrid>
    </StyledContainer>
    </>
  );
};

export default EditAddress;

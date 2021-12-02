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
import Axios, { Canceler } from "axios";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
//Redux
import * as accountActions from "../../../redux/actions/account";
import * as successActions from "../../../redux/actions/success";
//Custom libraries
import { AddressForm } from "../../widgets/address-form";
import addressUtil from "../../../utils/addressUtil";
import {
  ADDRESS_BOOK,
  ADDRESS_LINE,
  IS_NEW,
  ADDRESS_SHIPPING,
  ADDRESSLINE1,
  ADDRESSLINE2,
  EMPTY_STRING,
  STRING_TRUE,
} from "../../../constants/common";
import { ADDRESS_BOOK as ADDRESS_BOOK_ROUTE } from "../../../constants/routes";
//Foundation libraries
import personContactService from "../../../_foundation/apis/transaction/personContact.service";
//UI
import {
  StyledButton,
  StyledPaper,
  StyledContainer,
  StyledBreadcrumbs,
  StyledLink,
  StyledTypography,
  StyledGrid,
} from "../../StyledUI";
import { Divider } from "@material-ui/core";
import { AddressValidator } from "../../address/AddressValidator";

/**
 * Add new address component
 * @param toggleShowAddressForm
 */
function AddAddress() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
  const [newAddressFormData, setNewAddressFormData] = useState<any>(
    addressFormDataInit
  );
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
  const history = useHistory();

  /**
   * Form validation function
   * Return true when all mandatory field has been entered
   * else false
   */
  const canCreate = (): boolean => {
    return addressUtil.validateAddressForm(newAddressFormData);
  };

  /**
   * Create Address button handler to create the address
   * based on its type.
   */
  const createAddress = (fData?:any) => {
    // remove leading and trailing white space from all form input fields.
    let newAddressData = addressUtil.removeLeadingTrailingWhiteSpace(
      fData?fData:newAddressFormData
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
          const successMessage = {
            key: "success-message.ADD_ADDRESS_SUCCESS",
            messageParameters: {
              ["0"]: newAddressData.nickName,
            },
          };
          dispatch(
            successActions.HANDLE_SUCCESS_MESSAGE_ACTION(successMessage)
          );
        }
      })
      .catch((e) => {
        console.log("Could not create new address", e);
      });
    history.push(ADDRESS_BOOK_ROUTE);
  };

  useEffect(() => {
    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, []);
  /**
   * code for address verification
   */
  const [showDialog,setShowDialog] = useState<boolean>(false);
  const validateAddress = ()=>{
    setShowDialog(true);
  }
  const updateAddressFormData=(fData:any)=>{
    createAddress(fData);
    setShowDialog(false);
  }

  return (
    <>
    {showDialog?<AddressValidator addressData={newAddressFormData} updateAddress={updateAddressFormData} />:null}
    <StyledContainer cid="add-address">
      <StyledBreadcrumbs className="top-padding-6 vertical-padding-3">
        <StyledLink to={ADDRESS_BOOK_ROUTE}>
          <StyledTypography variant="h4">
            {t("AddressBook.Title")}
          </StyledTypography>
        </StyledLink>
        <span>
          <StyledTypography variant="h4">
            {t("AddressBook.AddrMsg")}
          </StyledTypography>
        </span>
      </StyledBreadcrumbs>
      <StyledGrid container spacing={3}>
        <StyledPaper className="horizontal-padding-3 vertical-padding-3">
          <StyledGrid item xs={12} md={6}>
            <AddressForm
              cid="newAddress"
              setAddressFormData={setNewAddressFormData}
              addressFormData={newAddressFormData}
              page={ADDRESS_BOOK}
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
              disabled={!canCreate()}
              onClick={() => validateAddress()}>
              {t("AddressBook.CreateAddress")}
            </StyledButton>
          </StyledGrid>
        </StyledPaper>
      </StyledGrid>
    </StyledContainer>
  </>
  );
}

export default AddAddress;

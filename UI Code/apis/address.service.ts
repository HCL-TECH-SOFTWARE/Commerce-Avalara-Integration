import Axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse, Canceler } from "axios";
import { getSite } from "../../_foundation/hooks/useSite";
import { storageSessionHandler } from "../../_foundation/utils/storageUtil";




const addressService = {



    validateAddress(address): AxiosPromise<any> {

        let storeID = getSite()?.storeID;
        console.log(JSON.stringify(address));
        const currentUser = storageSessionHandler.getCurrentUserAndLoadAccount();

        let requestOptions: AxiosRequestConfig = Object.assign({

            url: '/wcs/resources/avalara/' + storeID + '/resolveAddress',

            method: "POST",
            //data:{address},
            data: {
                "address1": address.addressLine ? address.addressLine[0] : address.addressLine1, "address2": address.addressLine ? address.addressLine[1] : address.addressLine2, "city": address.city, "state": address.state.toUpperCase(), "country": address.country.toUpperCase(), "zipcode": address.zipCode
            },

            headers: {

                "WCToken": currentUser.WCToken,

                "WCTrustedToken": currentUser.WCTrustedToken

            }



        });

        return Axios(requestOptions);

    }

}

export default addressService;


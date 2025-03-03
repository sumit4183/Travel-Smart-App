{
        "flightOffers": [
            {
                "type": "flight-offer",
                "id": "1",
                "source": "GDS",
                "nonHomogeneous": false,
                "lastTicketingDate": "2025-02-26",
                "itineraries": [
                    {
                        "segments": [
                            {
                                "departure": {
                                    "iataCode": "JFK",
                                    "at": "2025-03-12T06:59:00"
                                },
                                "arrival": {
                                    "iataCode": "LAS",
                                    "terminal": "3",
                                    "at": "2025-03-12T09:28:00"
                                },
                                "carrierCode": "F9",
                                "number": "3237",
                                "aircraft": {
                                    "code": "32Q"
                                },
                                "duration": "PT5H29M",
                                "id": "23",
                                "numberOfStops": 0,
                                "co2Emissions": [
                                    {
                                        "weight": 213,
                                        "weightUnit": "KG",
                                        "cabin": "ECONOMY"
                                    }
                                ]
                            },
                            {
                                "departure": {
                                    "iataCode": "LAS",
                                    "terminal": "3",
                                    "at": "2025-03-12T12:15:00"
                                },
                                "arrival": {
                                    "iataCode": "ONT",
                                    "at": "2025-03-12T13:22:00"
                                },
                                "carrierCode": "F9",
                                "number": "1357",
                                "aircraft": {
                                    "code": "32N"
                                },
                                "duration": "PT1H7M",
                                "id": "24",
                                "numberOfStops": 0,
                                "co2Emissions": [
                                    {
                                        "weight": 45,
                                        "weightUnit": "KG",
                                        "cabin": "ECONOMY"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "segments": [
                            {
                                "departure": {
                                    "iataCode": "ONT",
                                    "at": "2025-03-26T20:35:00"
                                },
                                "arrival": {
                                    "iataCode": "LAS",
                                    "terminal": "3",
                                    "at": "2025-03-26T21:54:00"
                                },
                                "carrierCode": "F9",
                                "number": "4206",
                                "aircraft": {
                                    "code": "321"
                                },
                                "duration": "PT1H19M",
                                "id": "63",
                                "numberOfStops": 0,
                                "co2Emissions": [
                                    {
                                        "weight": 44,
                                        "weightUnit": "KG",
                                        "cabin": "ECONOMY"
                                    }
                                ]
                            },
                            {
                                "departure": {
                                    "iataCode": "LAS",
                                    "terminal": "3",
                                    "at": "2025-03-26T23:54:00"
                                },
                                "arrival": {
                                    "iataCode": "JFK",
                                    "at": "2025-03-27T08:00:00"
                                },
                                "carrierCode": "F9",
                                "number": "3238",
                                "aircraft": {
                                    "code": "32Q"
                                },
                                "duration": "PT5H6M",
                                "id": "64",
                                "numberOfStops": 0,
                                "co2Emissions": [
                                    {
                                        "weight": 213,
                                        "weightUnit": "KG",
                                        "cabin": "ECONOMY"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "price": {
                    "currency": "EUR",
                    "total": "133.88",
                    "base": "80.00",
                    "fees": [
                        {
                            "amount": "0.00",
                            "type": "TICKETING"
                        },
                        {
                            "amount": "0.00",
                            "type": "SUPPLIER"
                        },
                        {
                            "amount": "0.00",
                            "type": "FORM_OF_PAYMENT"
                        }
                    ],
                    "grandTotal": "133.88",
                    "billingCurrency": "EUR"
                },
                "pricingOptions": {
                    "fareType": [
                        "PUBLISHED"
                    ],
                    "includedCheckedBagsOnly": false
                },
                "validatingAirlineCodes": [
                    "F9"
                ],
                "travelerPricings": [
                    {
                        "travelerId": "1",
                        "fareOption": "STANDARD",
                        "travelerType": "ADULT",
                        "price": {
                            "currency": "EUR",
                            "total": "133.88",
                            "base": "80.00",
                            "taxes": [
                                {
                                    "amount": "10.72",
                                    "code": "AY"
                                },
                                {
                                    "amount": "6.00",
                                    "code": "US"
                                },
                                {
                                    "amount": "17.24",
                                    "code": "XF"
                                },
                                {
                                    "amount": "19.92",
                                    "code": "ZP"
                                }
                            ],
                            "refundableTaxes": "99.88"
                        },
                        "fareDetailsBySegment": [
                            {
                                "segmentId": "23",
                                "cabin": "BUSINESS",
                                "fareBasis": "Z14VXP4",
                                "brandedFare": "ECO",
                                "class": "Z"
                            },
                            {
                                "segmentId": "24",
                                "cabin": "BUSINESS",
                                "fareBasis": "Z14VXP4",
                                "brandedFare": "ECO",
                                "class": "Z"
                            },
                            {
                                "segmentId": "63",
                                "cabin": "BUSINESS",
                                "fareBasis": "Z14VXP4",
                                "brandedFare": "ECO",
                                "class": "Z"
                            },
                            {
                                "segmentId": "64",
                                "cabin": "BUSINESS",
                                "fareBasis": "Z14VXP4",
                                "brandedFare": "ECO",
                                "class": "Z"
                            }
                        ]
                    }
                ]
            }
        ],
        "travelers": [
            {
                "id": "1",
                "dateOfBirth": "1982-01-16",
                "gender": "MALE",
                "name": {
                    "firstName": "JORGE",
                    "lastName": "GONZALES"
                },
                "documents": [
                    {
                        "number": "00000000",
                        "issuanceDate": "2015-04-14",
                        "expiryDate": "2025-04-14",
                        "issuanceCountry": "ES",
                        "issuanceLocation": "Madrid",
                        "nationality": "ES",
                        "birthPlace": "Madrid",
                        "documentType": "PASSPORT",
                        "holder": true
                    }
                ],
                "contact": {
                    "purpose": "STANDARD",
                    "phones": [
                        {
                            "deviceType": "MOBILE",
                            "countryCallingCode": "34",
                            "number": "480080076"
                        }
                    ],
                    "emailAddress": "jorge.gonzales833@telefonica.es"
                }
            }
        ],
}
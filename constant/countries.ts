const countries = [
    {
        "countryCode": "AF",
        "country": "Afghanistan",
        "flag": "🇦🇫"
    },
    {
        "countryCode": "AX",
        "country": "Åland Islands",
        "flag": "🇦🇽"
    },
    {
        "countryCode": "AL",
        "country": "Albania",
        "flag": "🇦🇱"
    },
    {
        "countryCode": "DZ",
        "country": "Algeria",
        "flag": "🇩🇿"
    },
    {
        "countryCode": "AS",
        "country": "American Samoa",
        "flag": "🇦🇸"
    },
    {
        "countryCode": "AD",
        "country": "Andorra",
        "flag": "🇦🇩"
    },
    {
        "countryCode": "AO",
        "country": "Angola",
        "flag": "🇦🇴"
    },
    {
        "countryCode": "AI",
        "country": "Anguilla",
        "flag": "🇦🇮"
    },
    {
        "countryCode": "AQ",
        "country": "Antarctica",
        "flag": "🇦🇶"
    },
    {
        "countryCode": "AG",
        "country": "Antigua and Barbuda",
        "flag": "🇦🇬"
    },
    {
        "countryCode": "AR",
        "country": "Argentina",
        "flag": "🇦🇷"
    },
    {
        "countryCode": "AM",
        "country": "Armenia",
        "flag": "🇦🇲"
    },
    {
        "countryCode": "AW",
        "country": "Aruba",
        "flag": "🇦🇼"
    },
    {
        "countryCode": "AU",
        "country": "Australia",
        "flag": "🇦🇺"
    },
    {
        "countryCode": "AT",
        "country": "Austria",
        "flag": "🇦🇹"
    },
    {
        "countryCode": "AZ",
        "country": "Azerbaijan",
        "flag": "🇦🇿"
    },
    {
        "countryCode": "BS",
        "country": "Bahamas",
        "flag": "🇧🇸"
    },
    {
        "countryCode": "BH",
        "country": "Bahrain",
        "flag": "🇧🇭"
    },
    {
        "countryCode": "BD",
        "country": "Bangladesh",
        "flag": "🇧🇩"
    },
    {
        "countryCode": "BB",
        "country": "Barbados",
        "flag": "🇧🇧"
    },
    {
        "countryCode": "BY",
        "country": "Belarus",
        "flag": "🇧🇾"
    },
    {
        "countryCode": "BE",
        "country": "Belgium",
        "flag": "🇧🇪"
    },
    {
        "countryCode": "BZ",
        "country": "Belize",
        "flag": "🇧🇿"
    },
    {
        "countryCode": "BJ",
        "country": "Benin",
        "flag": "🇧🇯"
    },
    {
        "countryCode": "BM",
        "country": "Bermuda",
        "flag": "🇧🇲"
    },
    {
        "countryCode": "BT",
        "country": "Bhutan",
        "flag": "🇧🇹"
    },
    {
        "countryCode": "BO",
        "country": "Bolivia, Plurinational State of",
        "flag": "🇧🇴"
    },
    {
        "countryCode": "BA",
        "country": "Bosnia and Herzegovina",
        "flag": "🇧🇦"
    },
    {
        "countryCode": "BW",
        "country": "Botswana",
        "flag": "🇧🇼"
    },
    {
        "countryCode": "BV",
        "country": "Bouvet Island",
        "flag": "🇧🇻"
    },
    {
        "countryCode": "BR",
        "country": "Brazil",
        "flag": "🇧🇷"
    },
    {
        "countryCode": "IO",
        "country": "British Indian Ocean Territory",
        "flag": "🇮🇴"
    },
    {
        "countryCode": "BN",
        "country": "Brunei Darussalam",
        "flag": "🇧🇳"
    },
    {
        "countryCode": "BG",
        "country": "Bulgaria",
        "flag": "🇧🇬"
    },
    {
        "countryCode": "BF",
        "country": "Burkina Faso",
        "flag": "🇧🇫"
    },
    {
        "countryCode": "BI",
        "country": "Burundi",
        "flag": "🇧🇮"
    },
    {
        "countryCode": "KH",
        "country": "Cambodia",
        "flag": "🇰🇭"
    },
    {
        "countryCode": "CM",
        "country": "Cameroon",
        "flag": "🇨🇲"
    },
    {
        "countryCode": "CA",
        "country": "Canada",
        "flag": "🇨🇦"
    },
    {
        "countryCode": "CV",
        "country": "Cabo Verde",
        "flag": "🇨🇻"
    },
    {
        "countryCode": "KY",
        "country": "Cayman Islands",
        "flag": "🇰🇾"
    },
    {
        "countryCode": "CF",
        "country": "Central African Republic",
        "flag": "🇨🇫"
    },
    {
        "countryCode": "TD",
        "country": "Chad",
        "flag": "🇹🇩"
    },
    {
        "countryCode": "CL",
        "country": "Chile",
        "flag": "🇨🇱"
    },
    {
        "countryCode": "CN",
        "country": "China",
        "flag": "🇨🇳"
    },
    {
        "countryCode": "CX",
        "country": "Christmas Island",
        "flag": "🇨🇽"
    },
    {
        "countryCode": "CC",
        "country": "Cocos (Keeling) Islands",
        "flag": "🇨🇨"
    },
    {
        "countryCode": "CO",
        "country": "Colombia",
        "flag": "🇨🇴"
    },
    {
        "countryCode": "KM",
        "country": "Comoros",
        "flag": "🇰🇲"
    },
    {
        "countryCode": "CG",
        "country": "Congo",
        "flag": "🇨🇬"
    },
    {
        "countryCode": "CD",
        "country": "Congo, The Democratic Republic of the",
        "flag": "🇨🇩"
    },
    {
        "countryCode": "CK",
        "country": "Cook Islands",
        "flag": "🇨🇰"
    },
    {
        "countryCode": "CR",
        "country": "Costa Rica",
        "flag": "🇨🇷"
    },
    {
        "countryCode": "CI",
        "country": "Côte d'Ivoire",
        "flag": "🇨🇮"
    },
    {
        "countryCode": "HR",
        "country": "Croatia",
        "flag": "🇭🇷"
    },
    {
        "countryCode": "CU",
        "country": "Cuba",
        "flag": "🇨🇺"
    },
    {
        "countryCode": "CY",
        "country": "Cyprus",
        "flag": "🇨🇾"
    },
    {
        "countryCode": "CZ",
        "country": "Czechia",
        "flag": "🇨🇿"
    },
    {
        "countryCode": "DK",
        "country": "Denmark",
        "flag": "🇩🇰"
    },
    {
        "countryCode": "DJ",
        "country": "Djibouti",
        "flag": "🇩🇯"
    },
    {
        "countryCode": "DM",
        "country": "Dominica",
        "flag": "🇩🇲"
    },
    {
        "countryCode": "DO",
        "country": "Dominican Republic",
        "flag": "🇩🇴"
    },
    {
        "countryCode": "EC",
        "country": "Ecuador",
        "flag": "🇪🇨"
    },
    {
        "countryCode": "EG",
        "country": "Egypt",
        "flag": "🇪🇬"
    },
    {
        "countryCode": "SV",
        "country": "El Salvador",
        "flag": "🇸🇻"
    },
    {
        "countryCode": "GQ",
        "country": "Equatorial Guinea",
        "flag": "🇬🇶"
    },
    {
        "countryCode": "ER",
        "country": "Eritrea",
        "flag": "🇪🇷"
    },
    {
        "countryCode": "EE",
        "country": "Estonia",
        "flag": "🇪🇪"
    },
    {
        "countryCode": "SZ",
        "country": "Eswatini",
        "flag": "🇸🇿"
    },
    {
        "countryCode": "ET",
        "country": "Ethiopia",
        "flag": "🇪🇹"
    },
    {
        "countryCode": "FK",
        "country": "Falkland Islands (Malvinas)",
        "flag": "🇫🇰"
    },
    {
        "countryCode": "FO",
        "country": "Faroe Islands",
        "flag": "🇫🇴"
    },
    {
        "countryCode": "FJ",
        "country": "Fiji",
        "flag": "🇫🇯"
    },
    {
        "countryCode": "FI",
        "country": "Finland",
        "flag": "🇫🇮"
    },
    {
        "countryCode": "FR",
        "country": "France",
        "flag": "🇫🇷"
    },
    {
        "countryCode": "GF",
        "country": "French Guiana",
        "flag": "🇬🇫"
    },
    {
        "countryCode": "PF",
        "country": "French Polynesia",
        "flag": "🇵🇫"
    },
    {
        "countryCode": "TF",
        "country": "French Southern Territories",
        "flag": "🇹🇫"
    },
    {
        "countryCode": "GA",
        "country": "Gabon",
        "flag": "🇬🇦"
    },
    {
        "countryCode": "GM",
        "country": "Gambia",
        "flag": "🇬🇲"
    },
    {
        "countryCode": "GE",
        "country": "Georgia",
        "flag": "🇬🇪"
    },
    {
        "countryCode": "DE",
        "country": "Germany",
        "flag": "🇩🇪"
    },
    {
        "countryCode": "GH",
        "country": "Ghana",
        "flag": "🇬🇭"
    },
    {
        "countryCode": "GI",
        "country": "Gibraltar",
        "flag": "🇬🇮"
    },
    {
        "countryCode": "GR",
        "country": "Greece",
        "flag": "🇬🇷"
    },
    {
        "countryCode": "GL",
        "country": "Greenland",
        "flag": "🇬🇱"
    },
    {
        "countryCode": "GD",
        "country": "Grenada",
        "flag": "🇬🇩"
    },
    {
        "countryCode": "GP",
        "country": "Guadeloupe",
        "flag": "🇬🇵"
    },
    {
        "countryCode": "GU",
        "country": "Guam",
        "flag": "🇬🇺"
    },
    {
        "countryCode": "GT",
        "country": "Guatemala",
        "flag": "🇬🇹"
    },
    {
        "countryCode": "GG",
        "country": "Guernsey",
        "flag": "🇬🇬"
    },
    {
        "countryCode": "GN",
        "country": "Guinea",
        "flag": "🇬🇳"
    },
    {
        "countryCode": "GW",
        "country": "Guinea-Bissau",
        "flag": "🇬🇼"
    },
    {
        "countryCode": "GY",
        "country": "Guyana",
        "flag": "🇬🇾"
    },
    {
        "countryCode": "HT",
        "country": "Haiti",
        "flag": "🇭🇹"
    },
    {
        "countryCode": "HM",
        "country": "Heard Island and McDonald Islands",
        "flag": "🇭🇲"
    },
    {
        "countryCode": "VA",
        "country": "Holy See (Vatican City State)",
        "flag": "🇻🇦"
    },
    {
        "countryCode": "HN",
        "country": "Honduras",
        "flag": "🇭🇳"
    },
    {
        "countryCode": "HK",
        "country": "Hong Kong",
        "flag": "🇭🇰"
    },
    {
        "countryCode": "HU",
        "country": "Hungary",
        "flag": "🇭🇺"
    },
    {
        "countryCode": "IS",
        "country": "Iceland",
        "flag": "🇮🇸"
    },
    {
        "countryCode": "IN",
        "country": "India",
        "flag": "🇮🇳"
    },
    {
        "countryCode": "ID",
        "country": "Indonesia",
        "flag": "🇮🇩"
    },
    {
        "countryCode": "IR",
        "country": "Iran, Islamic Republic of",
        "flag": "🇮🇷"
    },
    {
        "countryCode": "IQ",
        "country": "Iraq",
        "flag": "🇮🇶"
    },
    {
        "countryCode": "IE",
        "country": "Ireland",
        "flag": "🇮🇪"
    },
    {
        "countryCode": "IM",
        "country": "Isle of Man",
        "flag": "🇮🇲"
    },
    {
        "countryCode": "IL",
        "country": "Israel",
        "flag": "🇮🇱"
    },
    {
        "countryCode": "IT",
        "country": "Italy",
        "flag": "🇮🇹"
    },
    {
        "countryCode": "JM",
        "country": "Jamaica",
        "flag": "🇯🇲"
    },
    {
        "countryCode": "JP",
        "country": "Japan",
        "flag": "🇯🇵"
    },
    {
        "countryCode": "JE",
        "country": "Jersey",
        "flag": "🇯🇪"
    },
    {
        "countryCode": "JO",
        "country": "Jordan",
        "flag": "🇯🇴"
    },
    {
        "countryCode": "KZ",
        "country": "Kazakhstan",
        "flag": "🇰🇿"
    },
    {
        "countryCode": "KE",
        "country": "Kenya",
        "flag": "🇰🇪"
    },
    {
        "countryCode": "KI",
        "country": "Kiribati",
        "flag": "🇰🇮"
    },
    {
        "countryCode": "KP",
        "country": "Korea, Democratic People's Republic of",
        "flag": "🇰🇵"
    },
    {
        "countryCode": "KR",
        "country": "Korea, Republic of",
        "flag": "🇰🇷"
    },
    {
        "countryCode": "KW",
        "country": "Kuwait",
        "flag": "🇰🇼"
    },
    {
        "countryCode": "KG",
        "country": "Kyrgyzstan",
        "flag": "🇰🇬"
    },
    {
        "countryCode": "LA",
        "country": "Lao People's Democratic Republic",
        "flag": "🇱🇦"
    },
    {
        "countryCode": "LV",
        "country": "Latvia",
        "flag": "🇱🇻"
    },
    {
        "countryCode": "LB",
        "country": "Lebanon",
        "flag": "🇱🇧"
    },
    {
        "countryCode": "LS",
        "country": "Lesotho",
        "flag": "🇱🇸"
    },
    {
        "countryCode": "LR",
        "country": "Liberia",
        "flag": "🇱🇷"
    },
    {
        "countryCode": "LY",
        "country": "Libya",
        "flag": "🇱🇾"
    },
    {
        "countryCode": "LI",
        "country": "Liechtenstein",
        "flag": "🇱🇮"
    },
    {
        "countryCode": "LT",
        "country": "Lithuania",
        "flag": "🇱🇹"
    },
    {
        "countryCode": "LU",
        "country": "Luxembourg",
        "flag": "🇱🇺"
    },
    {
        "countryCode": "MO",
        "country": "Macao",
        "flag": "🇲🇴"
    },
    {
        "countryCode": "MG",
        "country": "Madagascar",
        "flag": "🇲🇬"
    },
    {
        "countryCode": "MW",
        "country": "Malawi",
        "flag": "🇲🇼"
    },
    {
        "countryCode": "MY",
        "country": "Malaysia",
        "flag": "🇲🇾"
    },
    {
        "countryCode": "MV",
        "country": "Maldives",
        "flag": "🇲🇻"
    },
    {
        "countryCode": "ML",
        "country": "Mali",
        "flag": "🇲🇱"
    },
    {
        "countryCode": "MT",
        "country": "Malta",
        "flag": "🇲🇹"
    },
    {
        "countryCode": "MH",
        "country": "Marshall Islands",
        "flag": "🇲🇭"
    },
    {
        "countryCode": "MQ",
        "country": "Martinique",
        "flag": "🇲🇶"
    },
    {
        "countryCode": "MR",
        "country": "Mauritania",
        "flag": "🇲🇷"
    },
    {
        "countryCode": "MU",
        "country": "Mauritius",
        "flag": "🇲🇺"
    },
    {
        "countryCode": "YT",
        "country": "Mayotte",
        "flag": "🇾🇹"
    },
    {
        "countryCode": "MX",
        "country": "Mexico",
        "flag": "🇲🇽"
    },
    {
        "countryCode": "FM",
        "country": "Micronesia, Federated States of",
        "flag": "🇫🇲"
    },
    {
        "countryCode": "MD",
        "country": "Moldova, Republic of",
        "flag": "🇲🇩"
    },
    {
        "countryCode": "MC",
        "country": "Monaco",
        "flag": "🇲🇨"
    },
    {
        "countryCode": "MN",
        "country": "Mongolia",
        "flag": "🇲🇳"
    },
    {
        "countryCode": "ME",
        "country": "Montenegro",
        "flag": "🇲🇪"
    },
    {
        "countryCode": "MS",
        "country": "Montserrat",
        "flag": "🇲🇸"
    },
    {
        "countryCode": "MA",
        "country": "Morocco",
        "flag": "🇲🇦"
    },
    {
        "countryCode": "MZ",
        "country": "Mozambique",
        "flag": "🇲🇿"
    },
    {
        "countryCode": "MM",
        "country": "Myanmar",
        "flag": "🇲🇲"
    },
    {
        "countryCode": "NA",
        "country": "Namibia",
        "flag": "🇳🇦"
    },
    {
        "countryCode": "NR",
        "country": "Nauru",
        "flag": "🇳🇷"
    },
    {
        "countryCode": "NP",
        "country": "Nepal",
        "flag": "🇳🇵"
    },
    {
        "countryCode": "NL",
        "country": "Netherlands, Kingdom of the",
        "flag": "🇳🇱"
    },
    {
        "countryCode": "AN",
        "country": "Netherlands Antilles",
        "flag": "🇳🇱"
    },
    {
        "countryCode": "NC",
        "country": "New Caledonia",
        "flag": "🇳🇨"
    },
    {
        "countryCode": "NZ",
        "country": "New Zealand",
        "flag": "🇳🇿"
    },
    {
        "countryCode": "NI",
        "country": "Nicaragua",
        "flag": "🇳🇮"
    },
    {
        "countryCode": "NE",
        "country": "Niger",
        "flag": "🇳🇪"
    },
    {
        "countryCode": "NG",
        "country": "Nigeria",
        "flag": "🇳🇬"
    },
    {
        "countryCode": "NU",
        "country": "Niue",
        "flag": "🇳🇺"
    },
    {
        "countryCode": "NF",
        "country": "Norfolk Island",
        "flag": "🇳🇫"
    },
    {
        "countryCode": "MP",
        "country": "Northern Mariana Islands",
        "flag": "🇲🇵"
    },
    {
        "countryCode": "MK",
        "country": "North Macedonia",
        "flag": "🇲🇰"
    },
    {
        "countryCode": "NO",
        "country": "Norway",
        "flag": "🇳🇴"
    },
    {
        "countryCode": "OM",
        "country": "Oman",
        "flag": "🇴🇲"
    },
    {
        "countryCode": "PK",
        "country": "Pakistan",
        "flag": "🇵🇰"
    },
    {
        "countryCode": "PW",
        "country": "Palau",
        "flag": "🇵🇼"
    },
    {
        "countryCode": "PS",
        "country": "Palestine, State of",
        "flag": "🇵🇸"
    },
    {
        "countryCode": "PA",
        "country": "Panama",
        "flag": "🇵🇦"
    },
    {
        "countryCode": "PG",
        "country": "Papua New Guinea",
        "flag": "🇵🇬"
    },
    {
        "countryCode": "PY",
        "country": "Paraguay",
        "flag": "🇵🇾"
    },
    {
        "countryCode": "PE",
        "country": "Peru",
        "flag": "🇵🇪"
    },
    {
        "countryCode": "PH",
        "country": "Philippines",
        "flag": "🇵🇭"
    },
    {
        "countryCode": "PN",
        "country": "Pitcairn",
        "flag": "🇵🇳"
    },
    {
        "countryCode": "PL",
        "country": "Poland",
        "flag": "🇵🇱"
    },
    {
        "countryCode": "PT",
        "country": "Portugal",
        "flag": "🇵🇹"
    },
    {
        "countryCode": "PR",
        "country": "Puerto Rico",
        "flag": "🇵🇷"
    },
    {
        "countryCode": "QA",
        "country": "Qatar",
        "flag": "🇶🇦"
    },
    {
        "countryCode": "RE",
        "country": "Réunion",
        "flag": "🇷🇪"
    },
    {
        "countryCode": "RO",
        "country": "Romania",
        "flag": "🇷🇴"
    },
    {
        "countryCode": "RU",
        "country": "Russian Federation",
        "flag": "🇷🇺"
    },
    {
        "countryCode": "RW",
        "country": "Rwanda",
        "flag": "🇷🇼"
    },
    {
        "countryCode": "BL",
        "country": "Saint Barthélemy",
        "flag": "🇧🇱"
    },
    {
        "countryCode": "SH",
        "country": "Saint Helena, Ascension and Tristan da Cunha",
        "flag": "🇸🇭"
    },
    {
        "countryCode": "KN",
        "country": "Saint Kitts and Nevis",
        "flag": "🇰🇳"
    },
    {
        "countryCode": "LC",
        "country": "Saint Lucia",
        "flag": "🇱🇨"
    },
    {
        "countryCode": "MF",
        "country": "Saint Martin",
        "flag": "🇲🇫"
    },
    {
        "countryCode": "PM",
        "country": "Saint Pierre and Miquelon",
        "flag": "🇵🇲"
    },
    {
        "countryCode": "VC",
        "country": "Saint Vincent and the Grenadines",
        "flag": "🇻🇨"
    },
    {
        "countryCode": "WS",
        "country": "Samoa",
        "flag": "🇼🇸"
    },
    {
        "countryCode": "SM",
        "country": "San Marino",
        "flag": "🇸🇲"
    },
    {
        "countryCode": "ST",
        "country": "Sao Tome and Principe",
        "flag": "🇸🇹"
    },
    {
        "countryCode": "SA",
        "country": "Saudi Arabia",
        "flag": "🇸🇦"
    },
    {
        "countryCode": "SN",
        "country": "Senegal",
        "flag": "🇸🇳"
    },
    {
        "countryCode": "RS",
        "country": "Serbia",
        "flag": "🇷🇸"
    },
    {
        "countryCode": "SC",
        "country": "Seychelles",
        "flag": "🇸🇨"
    },
    {
        "countryCode": "SL",
        "country": "Sierra Leone",
        "flag": "🇸🇱"
    },
    {
        "countryCode": "SG",
        "country": "Singapore",
        "flag": "🇸🇬"
    },
    {
        "countryCode": "SK",
        "country": "Slovakia",
        "flag": "🇸🇰"
    },
    {
        "countryCode": "SI",
        "country": "Slovenia",
        "flag": "🇸🇮"
    },
    {
        "countryCode": "SB",
        "country": "Solomon Islands",
        "flag": "🇸🇧"
    },
    {
        "countryCode": "SO",
        "country": "Somalia",
        "flag": "🇸🇴"
    },
    {
        "countryCode": "ZA",
        "country": "South Africa",
        "flag": "🇿🇦"
    },
    {
        "countryCode": "GS",
        "country": "South Georgia and the South Sandwich Islands",
        "flag": "🇬🇸"
    },
    {
        "countryCode": "ES",
        "country": "Spain",
        "flag": "🇪🇸"
    },
    {
        "countryCode": "LK",
        "country": "Sri Lanka",
        "flag": "🇱🇰"
    },
    {
        "countryCode": "SD",
        "country": "Sudan",
        "flag": "🇸🇩"
    },
    {
        "countryCode": "SR",
        "country": "Suriname",
        "flag": "🇸🇷"
    },
    {
        "countryCode": "SJ",
        "country": "Svalbard and Jan Mayen",
        "flag": "🇸🇯"
    },
    {
        "countryCode": "SE",
        "country": "Sweden",
        "flag": "🇸🇪"
    },
    {
        "countryCode": "CH",
        "country": "Switzerland",
        "flag": "🇨🇭"
    },
    {
        "countryCode": "SY",
        "country": "Syrian Arab Republic",
        "flag": "🇸🇾"
    },
    {
        "countryCode": "TW",
        "country": "Taiwan, Province of China",
        "flag": "🇹🇼"
    },
    {
        "countryCode": "TJ",
        "country": "Tajikistan",
        "flag": "🇹🇯"
    },
    {
        "countryCode": "TZ",
        "country": "Tanzania, United Republic of",
        "flag": "🇹🇿"
    },
    {
        "countryCode": "TH",
        "country": "Thailand",
        "flag": "🇹🇭"
    },
    {
        "countryCode": "TL",
        "country": "Timor-Leste",
        "flag": "🇹🇱"
    },
    {
        "countryCode": "TG",
        "country": "Togo",
        "flag": "🇹🇬"
    },
    {
        "countryCode": "TK",
        "country": "Tokelau",
        "flag": "🇹🇰"
    },
    {
        "countryCode": "TO",
        "country": "Tonga",
        "flag": "🇹🇴"
    },
    {
        "countryCode": "TT",
        "country": "Trinidad and Tobago",
        "flag": "🇹🇹"
    },
    {
        "countryCode": "TN",
        "country": "Tunisia",
        "flag": "🇹🇳"
    },
    {
        "countryCode": "TM",
        "country": "Turkmenistan",
        "flag": "🇹🇲"
    },
    {
        "countryCode": "TC",
        "country": "Turks and Caicos Islands",
        "flag": "🇹🇨"
    },
    {
        "countryCode": "TV",
        "country": "Tuvalu",
        "flag": "🇹🇻"
    },
    {
        "countryCode": "TR",
        "country": "Türkiye",
        "flag": "🇹🇷"
    },
    {
        "countryCode": "UG",
        "country": "Uganda",
        "flag": "🇺🇬"
    },
    {
        "countryCode": "UA",
        "country": "Ukraine",
        "flag": "🇺🇦"
    },
    {
        "countryCode": "AE",
        "country": "United Arab Emirates",
        "flag": "🇦🇪"
    },
    {
        "countryCode": "GB",
        "country": "United Kingdom",
        "flag": "🇬🇧"
    },
    {
        "countryCode": "US",
        "country": "United States of America",
        "flag": "🇺🇸"
    },
    {
        "countryCode": "UM",
        "country": "United States Minor Outlying Islands",
        "flag": "🇺🇸"
    },
    {
        "countryCode": "UY",
        "country": "Uruguay",
        "flag": "🇺🇾"
    },
    {
        "countryCode": "UZ",
        "country": "Uzbekistan",
        "flag": "🇺🇿"
    },
    {
        "countryCode": "VU",
        "country": "Vanuatu",
        "flag": "🇻🇺"
    },
    {
        "countryCode": "VE",
        "country": "Venezuela, Bolivarian Republic of",
        "flag": "🇻🇪"
    },
    {
        "countryCode": "VN",
        "country": "Viet Nam",
        "flag": "🇻🇳"
    },
    {
        "countryCode": "VG",
        "country": "Virgin Islands, British",
        "flag": "🇻🇬"
    },
    {
        "countryCode": "VI",
        "country": "Virgin Islands, U.S.",
        "flag": "🇻🇮"
    },
    {
        "countryCode": "WF",
        "country": "Wallis and Futuna",
        "flag": "🇼🇫"
    },
    {
        "countryCode": "EH",
        "country": "Western Sahara",
        "flag": "🇪🇭"
    },
    {
        "countryCode": "YE",
        "country": "Yemen",
        "flag": "🇾🇪"
    },
    {
        "countryCode": "ZM",
        "country": "Zambia",
        "flag": "🇿🇲"
    },
    {
        "countryCode": "ZW",
        "country": "Zimbabwe",
        "flag": "🇿🇼"
    }
]

export default countries
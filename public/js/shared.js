// TODO: move this to db
const countries = ["Internet", "Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla",
"Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan",
"Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan",
"Bolivia","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory",
"Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde",
"Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island",
"Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, The Democratic Republic of The",
"Cook Islands","Costa Rica","Cote D'ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
"Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
"Estonia","Ethiopia","Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France",
"French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany",
"Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea",
"Guinea-bissau","Guyana","Haiti","Heard Island and Mcdonald Islands","Holy See (Vatican City State)",
"Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran, Islamic Republic of","Iraq",
"Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya",
"Kiribati","Korea, Democratic People's Republic of","Korea, Republic of","Kuwait","Kyrgyzstan",
"Lao People's Democratic Republic","Latvia","Lebanon","Lesotho","Liberia","Libyan Arab Jamahiriya",
"Liechtenstein","Lithuania","Luxembourg","Macao","Macedonia, The Former Yugoslav Republic of","Madagascar",
"Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius",
"Mayotte","Mexico","Micronesia, Federated States of","Moldova, Republic of","Monaco","Mongolia",
"Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
"Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island",
"Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestinian Territory, Occupied","Panama",
"Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar",
"Reunion","Romania","Russian Federation","Rwanda","Saint Helena","Saint Kitts and Nevis","Saint Lucia",
"Saint Pierre and Miquelon","Saint Vincent and The Grenadines","Samoa","San Marino","Sao Tome and Principe",
"Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
"Solomon Islands","Somalia","South Africa","South Georgia and The South Sandwich Islands","Spain","Sri Lanka",
"Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syrian Arab Republic",
"Taiwan","Tajikistan","Tanzania, United Republic of","Thailand","Timor-leste","Togo","Tokelau","Tonga",
"Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine",
"United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay",
"Uzbekistan","Vanuatu","Venezuela","Viet Nam","Virgin Islands, British","Virgin Islands, United States",
"Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"];

const genders = [ // TODO: taken from FB list, need to review, move to DB
  "Agender", "Androgyne", "Androgynous", "Bigender", "Cis", "Cisgender", "Cis Female", "Cis Male", "Cis Man",
  "Cis Woman", "Cisgender Female", "Cisgender Male", "Cisgender Man", "Cisgender Woman", "Female to Male", "FTM",
  "Gender Fluid", "Gender Nonconforming", "Gender Questioning", "Gender Variant", "Genderqueer", "Intersex",
  "Male to Female", "MTF", "Neither", "Neutrois", "Non-binary", "Other", "Pangender", "Trans", "Trans*", "Trans Female",
  "Trans* Female", "Trans Male", "Trans* Male", "Trans Man", "Trans* Man", "Trans Person", "Trans* Person", "Trans Woman",
  "Trans* Woman", "Transfeminine", "Transgender", "Transgender Female", "Transgender Male", "Transgender Man",
  "Transgender Person", "Transgender Woman", "Transmasculine", "Transsexual", "Transsexual Female", "Transsexual Male", 
  "Transsexual Man", "Transsexual Person", "Transsexual Woman", "Two-Spirit"
];

let metadata;

const populateForm = () => {
  $.get('/metadata', (data) => {
    console.log(data)
    metadata = data;
  });

  countries.forEach(c => {
    $('#artist-country-residence').append('<option value="'+c+'">'+c+'</option>');
    $('#artist-country-birth').append('<option value="'+c+'">'+c+'</option>');
  });

  genders.forEach(c => {
    $('#artist-gender').append('<option value="'+c+'">'+c+'</option>');
  });
};

const populateWork = (ind) => {
  metadata.categories.forEach(c => {
    $('#'+ind+'-work-categories').append('<option value="'+c+'">'+c+'</option>');
  });
  metadata.software.forEach(c => {
    $('#'+ind+'-work-software').append('<option value="'+c+'">'+c+'</option>');
  });
  metadata.code.forEach(c => {
    $('#'+ind+'-work-code').append('<option value="'+c+'">'+c+'</option>');
  });
}

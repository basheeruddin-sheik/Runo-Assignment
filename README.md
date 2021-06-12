Assignment: An app created for vaccine registration (similar to that of Arogyasetu Cowin part).

User schema: name, phone, age, pincode, aadhar, password and token.

Registration schema: user(user id), username, age, pincode, phone, stateofDosage, slotDate and slotTime.

Admin schema: phone, password and token.

Note for all APIs timeFormate:"hh.mmAM-hh.mmPM" and dateFormate: "dd-mm-yyyy"
User APIs:
API endpoint: /signup
Functionality: It used to signup the user.
body: name, phone, age, pincode, aadhar and password

API endpoint: /login
Functionality: It used to signin the user. Create and update token when user logged in.
body: phone and password

API endpoint: /logout
Functionality: It used to logout the user. Delete the token whend user logged out.

API endpoint: /user/dates
Functionality: It used to get the 30 dates and availability of them.

API endpoint: /user/dates/slots
Functionality: It used to get the 14 on a given date and availability of them.
body: slotDate

API endpoint: /user/dates/slots/slotRegistration
Functionality: It used to register for vaccination(first/second).
body: username, age, pincode, phone, slotDate, slotTime.
query: dose = 1/2 (1=firstDose and 2=secondDose)

API endpoint: /user/getRegistrationDetails
Functionality: It used to user get the details of dosage registration.

API endpoint: /user/updateRegistration
Functionality: It used to update the slot before more than 24 hours time to dosage time.

Admin APIs:
API endpoint: /admin/signup
Functionality: It used to signup the admin.
body: phone and password

API endpoint: /admin/login
Functionality: It used to login the admin. create and update the token when admin logged in.
body: phone and password

API endpoint: /admin/logout
Functionality: It used to logout the admin. Delete the token when admin logged out.

API endpoint: /admin/registrationsList
Functionality: It used to get the registered slots based on the filters.
params: stateOfDosage, age, pincode, slotDate.

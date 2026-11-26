# Laneway Car Hire: Car Rental Management System (Task 1)

A car rental website where customers browse a fleet of 14 cars, search and filter them, view car details, book a car with a validated form and manage their bookings.

**Tech:** HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript (ES2020), LocalStorage. No frameworks and no build step.

## Brief checklist

| Requirement | Where |
|---|---|
| Homepage: hero, company introduction, featured cars, call-to-action buttons | `index.html` |
| Car listing: image, name/model, price per day, fuel type, seats, availability | `cars.html` (data in `js/data.js`) |
| Search by name/model | Search box on `cars.html` |
| Filter by price, category and type | Type chips, fuel chips, max-price slider, seats, gearbox, "only available" toggle, plus sorting |
| Booking form: name, contact details, rental dates, choose a car, submit | `booking.html` |
| Form validation | Required fields, SA mobile format, email format, driver aged 21+, return date after pickup, no past dates, 60-day maximum, terms checkbox |
| Responsive design | Tested at 360px, 768px and 1366px |
| Navigation bar and footer with contact/social links | Shared, rendered by `js/common.js` |

## Bonus features included

- **Car details page** (`car.html?id=4`) with specs, features, a price calculator and similar cars
- **Booking history** (`bookings.html`) with reference numbers, status and free cancellation
- **Login and sign-up UI** (`login.html`) with validation; the signed-in name pre-fills the booking form
- **Dark mode**, remembered between visits and following the system setting by default
- **LocalStorage** for bookings, accounts and the theme
- **Live price summary**: days × rate, 10% weekly discount, extras and the young-driver fee
- **Homepage quick search**: branch and dates carry through to the listing and booking form
- A one-time animation of a car driving onto the hero road (turned off when reduced motion is on)

## Folder structure

```
car-rental/
├── index.html        Homepage
├── cars.html         Listing with search, filters and sorting
├── car.html          Car details (?id=)
├── booking.html      Booking form (?car=&from=&to=&location=)
├── bookings.html     My bookings
├── login.html        Sign in / create account
├── 404.html          Not-found page
├── css/styles.css    All styles, light and dark themes
├── js/
│   ├── data.js       Cars, branches, extras
│   ├── common.js     Header, footer, theme, storage, shared helpers
│   ├── home.js, cars.js, car.js, booking.js, bookings.js, login.js
└── assets/           Car illustrations (SVG) and favicon
```

## Design

Road-signage inspired: asphalt grey, road-marking yellow and signal blue, with Barlow Condensed (a highway-sign style typeface) for headings. Prices are in rand with VAT included.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to AWS

### Option A: AWS Amplify Hosting (easiest)

1. Sign in to the AWS Console and open **AWS Amplify**.
2. Choose **Create new app**, then **Deploy without Git**, then **Next**.
3. App name: `laneway-car-rental`. Branch name: `main`.
4. For **Method**, choose **Drag and drop**, then drop **`laneway-car-rental.zip`** (this zip, as it is: `index.html` is already at the top level).
5. Choose **Save and deploy**, then open the domain shown on the app's overview page.

Optional custom 404 page: **Hosting → Rewrites and redirects → Manage redirects**, then add source `/<*>`, target `/404.html`, type `404 (Rewrite)`.

To update the site later, zip the files again and drag the zip onto the app's deployment page.

### Option B: Amazon S3 static website (+ CloudFront for HTTPS)

1. Create an S3 bucket, e.g. `laneway-car-rental-<yourname>`, in a nearby region such as `af-south-1` (Cape Town).
2. Upload the files so `index.html` sits at the top of the bucket. With the AWS CLI, run this from inside the unzipped folder:
   ```bash
   aws s3 sync . s3://laneway-car-rental-<yourname> --delete --exclude "README.md" --exclude "screenshots/*"
   ```
3. Bucket → **Properties** → **Static website hosting** → Enable. Index document: `index.html`. Error document: `404.html`.
4. Bucket → **Permissions** → turn off **Block all public access**, and add this bucket policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::laneway-car-rental-<yourname>/*"
     }]
   }
   ```
5. Open the bucket website endpoint shown under Static website hosting (HTTP only). For HTTPS, put a **CloudFront** distribution in front of the bucket, with `index.html` as the default root object.

## Notes

- **No backend:** bookings, orders and results are saved in the visitor's browser with `localStorage`, so they stay on that device only. Sign-in and payment screens are UI only, with no real passwords stored and no payment taken.
- **Images** are original SVG illustrations made for this project. To use real photos, replace the files in `assets/` or change the image paths in `js/data.js`.
- **Screenshots** in `screenshots/` were taken without the Google Fonts loaded, so the lettering on the live site looks a little different.

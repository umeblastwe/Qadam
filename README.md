# Qadam (قدم) - Online Shoe Store

**Course:** Financial Management, Assignment 1 (KASBIT, Spring 2026)
**Business:** Qadam, an online shoe brand in Pakistan. *Qadam* means "a step".

## 1. Business idea
Qadam sells shoes for men and women online: sneakers, leather loafers, Oxfords, sandals, flats, and traditional Pakistani footwear (khussa and Peshawari chappal). Prices range from PKR 2,900 to PKR 5,800. Customers order through the website, WhatsApp or Instagram and pay cash on delivery. We pack orders ourselves and ship by courier across Pakistan.

| # | Product | Category | Price (PKR) |
|---|---------|----------|------------:|
| 1 | Men's Navy & White Leather Sneakers | Men | 4,500 |
| 2 | Women's Pastel Beige Block-Heel Sandals | Women | 3,800 |
| 3 | Men's Cushioned Brown Leather Loafers | Men | 5,200 |
| 4 | Women's Blush Pink Cushioned Walking Sneakers | Women | 4,200 |
| 5 | Men's Charcoal Grey Athletic Running Sneakers | Men | 4,800 |
| 6 | Women's Tan Leather Slip-On Mule Flats | Women | 3,200 |
| 7 | Men's Classic Black Leather Oxford Dress Shoes | Men | 5,800 |
| 8 | Women's Embroidered Mint Green Cushioned Khussa | Women | 2,900 |
| 9 | Men's Hand-Stitched Tan Leather Peshawari Chappal | Men | 3,900 |

## 2. Startup costs (one-time)
| Item | PKR |
|------|----:|
| Opening stock (about 2 months of shoes) | 250,000 |
| Website, domain & hosting (first year) | 20,000 |
| Branding & logo | 25,000 |
| Packaging material | 15,000 |
| Launch marketing & photography | 35,000 |
| Registration & legal | 10,000 |
| Emergency fund | 20,000 |
| **Total** | **375,000** |

## 3. Sources of funds
| Source | PKR | Share |
|--------|----:|------:|
| Personal savings | 150,000 | 40% |
| Family support | 125,000 | 33% |
| Partner investment | 100,000 | 27% |
| **Total** | **375,000** | 100% |

Funds raised equal the startup cost, so no loan is needed.

## 4. Monthly sales and expenses (estimate)
Expected sales: **78 pairs per month** (12 + 8 + 6 + 10 + 10 + 8 + 5 + 12 + 7, in the product order above).

| | PKR per month |
|---|---:|
| **Sales (revenue)** | **322,300** |
| Cost of shoes (55% of selling price) | 177,265 |
| **Gross profit** | **145,035** |
| Packaging (150 per pair x 78) | 11,700 |
| Courier (250 per pair x 78) | 19,500 |
| Social media marketing | 30,000 |
| Part-time packer / helper | 25,000 |
| Internet, hosting & tools | 3,000 |
| Miscellaneous | 8,000 |
| **Total other expenses** | **97,200** |

## 5. Expected profit
```
Net profit = Sales - Cost of shoes - Other expenses
           = 322,300 - 177,265 - 97,200
           = PKR 47,835 per month   (14.8% of sales)
```
Time to earn back the startup cost: 375,000 / 47,835 = about **7.8 months**.

## 6. The website
- Home page with banner, product collection (filter by Men/Women, sort by price, quick view)
- Offer banner, About section
- Order request form with live total and validation (saved in a database)
- Contact section (edit `data/finance.json` to put in your real phone, email and Instagram)
- Admin page at `/admin` to see orders and change their status (default key: `qadam123`)

### Project structure
```
index.html          website page
admin.html          order list for the owner
app.py              Flask backend (API + SQLite database)
build_static.py     rebuilds static/js/data.js after you edit data/*.json
data/products.json  product names, prices, descriptions
data/finance.json   startup costs, funds, expenses, contact details
static/             css, js, images
```

### Run it
```bash
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000. Orders are saved in `data/qadam.db`.
Without the backend, you can open `index.html` directly. The order form then saves requests in the browser (demo mode).

**API:** `GET /api/products`, `GET /api/finance`, `POST /api/calculate`, `POST /api/orders`, `GET /api/orders` (admin key needed).

### Add a product
Add its image to `static/images/`, add an entry in `data/products.json`, then run `python build_static.py`.

## 7. AI tools used
- **Google Gemini:** generated the product photos.
- **Claude (Anthropic):** wrote the website code (HTML, CSS, JavaScript, Flask backend), suggested the startup cost, sales and expense estimates, and wrote this README.

All financial figures are estimates and were checked by the group. This is a student prototype, not a real store.

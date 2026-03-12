Here is an example **`product-image.md`** documentation file you can place in your project (for example: `/docs/product-image.md`). It explains the **image flow, compression step, and upload to Cloudinary** in a way that matches your **service → repository → api architecture**.

---

```md
# Product Image Upload Flow

This document explains how product images are processed before being stored in Cloudinary.  
The main goal is to **optimize performance and storage** by compressing images before uploading.

## Overview Architecture

The image upload process follows the service architecture:

client → api → service → cloudinary

Database storage (via repository) is used only to store the image metadata (url, public_id, etc).

```

Client
│
│ Upload Image
▼
API Route (/api/product/upload-image)
│
│ validate file
▼
Service Layer
│
├── compress image
├── generate file name
└── upload to Cloudinary
▼
Cloudinary
│
▼
Repository
│
└── store image metadata in database

```

---

# Feature Goals

1. Reduce image size before upload
2. Optimize bandwidth usage
3. Improve page load performance
4. Maintain good image quality
5. Store only metadata in database

---

# Folder Structure

Example implementation:

```

server
├─ services
│   └─ product-image.service.ts
│
├─ repositories
│   └─ product-image.repository.ts
│
├─ utils
│   ├─ image-compress.ts
│   └─ cloudinary.ts
│
api/image/
└─ routes
└─ product
└─ upload-image.ts

```

---

# Image Upload Flow

## 1. Client Upload

Client sends multipart form data.

Example:

```

POST /api/product/upload-image
Content-Type: multipart/form-data

file: product-image.jpg

```

---

## 2. API Route

Responsibilities:

- Validate file
- Pass file buffer to service

Example validation:

- file type must be image
- max size 5MB

Supported formats:

```

jpeg
jpg
png
webp

```

---

## 3. Service Layer

Service handles the business logic.

Steps:

1. Receive file buffer
2. Compress image
3. Generate filename
4. Upload to Cloudinary
5. Save metadata to database

Example flow:

```

file buffer
│
▼
compress image
│
▼
upload to cloudinary
│
▼
save metadata

```

---

# Image Compression

Compression happens **before upload**.

Benefits:

- faster upload
- smaller storage
- optimized delivery

Recommended library:

```

sharp

```

Compression rules:

| Type | Max Width | Quality |
|-----|------|------|
| JPEG | 1200px | 80% |
| PNG | 1200px | optimized |
| WEBP | 1200px | 80% |

Example logic:

```

resize to max width 1200px
convert to webp
quality 80

```

---

# Cloudinary Upload

Images are uploaded to a specific folder.

Example:

```

products/

```

Example result returned from Cloudinary:

```

{
public_id: "products/abc123",
secure_url: "[https://res.cloudinary.com/.../image/upload/products/abc123.webp](https://res.cloudinary.com/.../image/upload/products/abc123.webp)",
width: 1200,
height: 800,
format: "webp"
}

```

---

# Database Storage

Database stores metadata only.

Example table:

```

product_images

```

Columns:

| field | type |
|------|------|
| id | uuid |
| product_id | uuid |
| public_id | text |
| url | text |
| format | text |
| width | int |
| height | int |
| created_at | timestamp |

---

# Example Metadata

```

{
product_id: "uuid",
public_id: "products/abc123",
url: "[https://res.cloudinary.com/.../products/abc123.webp](https://res.cloudinary.com/.../products/abc123.webp)",
width: 1200,
height: 800
}

```

---
# env key
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Security Validation

Required validations:

- file size limit
- allowed mime types
- prevent executable uploads

Example allowed mime types:

```

image/jpeg
image/png
image/webp
image/jpg
```

---

# Performance Considerations

1. Compress images before upload
2. Convert to WEBP format
3. Limit maximum dimensions
4. Use CDN delivery (Cloudinary)

---

# Future Improvements

Possible improvements:
- compress image before push
- single image upload
- drag and drop uploader
- background job processing



---

# Summary

Image upload process:

1. Client uploads image
2. API validates file
3. Service compresses image
4. Upload image to Cloudinary
5. Save metadata in database

Result:

- optimized images
- faster website
- lower storage usage
```


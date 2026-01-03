# Certificate Images

Place your certificate images in this folder.

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended size**: 1200x800px or similar aspect ratio
- **File naming**: Use descriptive names like `certificate-1.jpg`, `certificate-2.png`, etc.

## How to Add Images

1. Add your certificate image file to this folder (`public/certificates/`)
2. Update the `image` field in `data/certificates.json` with the path:
   - For local images: `/certificates/your-image.jpg`
   - For external URLs: `https://example.com/path/to/image.jpg`

## Example

```json
{
  "id": 1,
  "title": "My Certificate",
  "image": "/certificates/certificate-1.jpg",
  ...
}
```


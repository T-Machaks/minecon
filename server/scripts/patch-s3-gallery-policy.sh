#!/usr/bin/env bash
# Adds gallery-images/* to the minecon S3 bucket public-read policy.
# Run once on server or any machine with AWS credentials:
#   bash server/scripts/patch-s3-gallery-policy.sh

BUCKET="minecon"
REGION="af-south-1"

aws s3api put-bucket-policy --bucket "$BUCKET" --region "$REGION" --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::minecon/booth-images/*",
        "arn:aws:s3:::minecon/guide-images/*",
        "arn:aws:s3:::minecon/videos/*",
        "arn:aws:s3:::minecon/lot-images/*",
        "arn:aws:s3:::minecon/exhibitor-logos/*",
        "arn:aws:s3:::minecon/gallery-images/*"
      ]
    }
  ]
}'

echo "Bucket policy updated — gallery-images/* is now publicly readable."

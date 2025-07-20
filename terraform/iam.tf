# IAM role for HealthImaging import jobs
resource "aws_iam_role" "healthimaging_import" {
  name = "${var.project_name}-healthimaging-import-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "medical-imaging.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    ProvisionedBy = "terraform"
    Environment   = var.environment
    Project       = var.project_name
    Purpose       = "HealthImaging import job execution"
  }
}

# IAM policy for S3 access
resource "aws_iam_role_policy" "healthimaging_s3_access" {
  name = "${var.project_name}-healthimaging-s3-policy"
  role = aws_iam_role.healthimaging_import.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.dicom_files.arn,
          "${aws_s3_bucket.dicom_files.arn}/*"
        ]
      }
    ]
  })
}


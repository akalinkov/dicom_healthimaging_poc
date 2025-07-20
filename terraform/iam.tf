# IAM policy for HealthImaging operations (for console use and API access)
resource "aws_iam_policy" "healthimaging_policy" {
  name        = "${var.project_name}-healthimaging-policy"
  description = "Policy for DICOM HealthImaging POC operations and import jobs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "HealthImagingDatastoreManagement"
        Effect = "Allow"
        Action = [
          "medical-imaging:CreateDatastore",
          "medical-imaging:GetDatastore",
          "medical-imaging:ListDatastores",
          "medical-imaging:DeleteDatastore"
        ]
        Resource = "*"
      },
      {
        Sid    = "HealthImagingImageOperations"
        Effect = "Allow"
        Action = [
          "medical-imaging:SearchImageSets",
          "medical-imaging:GetImageSetMetadata",
          "medical-imaging:GetImageFrame",
          "medical-imaging:ListImageSetVersions"
        ]
        Resource = "*"
      },
      {
        Sid    = "HealthImagingImportOperations"
        Effect = "Allow"
        Action = [
          "medical-imaging:StartDICOMImportJob",
          "medical-imaging:GetDICOMImportJob",
          "medical-imaging:ListDICOMImportJobs"
        ]
        Resource = "*"
      },
      {
        Sid    = "S3AccessForDICOMFiles"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetBucketPublicAccessBlock",
          "s3:PutBucketPublicAccessBlock"
        ]
        Resource = [
          aws_s3_bucket.dicom_files.arn,
          "${aws_s3_bucket.dicom_files.arn}/*"
        ]
      },
      {
        Sid    = "IAMPassRoleForHealthImaging"
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = aws_iam_role.healthimaging_import.arn
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "medical-imaging.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    ProvisionedBy = "terraform"
    Environment   = var.environment
    Project       = var.project_name
  }
}

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


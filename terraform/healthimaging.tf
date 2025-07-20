# HealthImaging Datastore
resource "awscc_healthimaging_datastore" "dicom_datastore" {
  datastore_name = "${var.project_name}-datastore"

  tags = {
    ProvisionedBy = "terraform"
    Environment   = var.environment
    Project       = var.project_name
    Purpose       = "DICOM Medical Imaging Storage"
  }
}

# Output the datastore ID for use in application
output "healthimaging_datastore_id" {
  description = "ID of the HealthImaging datastore"
  value       = awscc_healthimaging_datastore.dicom_datastore.id
}

output "healthimaging_datastore_arn" {
  description = "ARN of the HealthImaging datastore"
  value       = awscc_healthimaging_datastore.dicom_datastore.datastore_arn
}

export class CreateOrganizationDto {
  name: string
  description?: string
}

export class UpdateOrganizationDto {
  name?: string
  description?: string
}

export class OrganizationResponseDto {
  id: number
  name: string
  code: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

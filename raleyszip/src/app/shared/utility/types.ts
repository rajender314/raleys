export class Pagination {
  page: 1;
  pageSize: 40;
  search?: string;
  sort?: string | number;
  status?: boolean | string;
  org_type?: number | string;
  milestone_type?: number | string;
}
export class ImportParams {
  samplePath: string;
  url: string;
  title: string;
  format: string;
  container: string;
}

export class SaveFilterParams {
  name: string;
  ad_id: string;
  filter_info: [];
  filter_type: number;
  shared_users: [];
}

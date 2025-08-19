export interface MultipleResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  data: T[];
}

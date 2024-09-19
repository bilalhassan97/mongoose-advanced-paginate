import { AggregateOptions, Model, PipelineStage, Types } from 'mongoose';

export enum ElementType {
  ID = 'id',
  STRING = 'string',
}

export type FilterElement = string;

export interface Selectors {
  [key: string]: string | number;
}

export type SearchElement = string;

export enum SortOrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type SortOrder = {
  direction: SortOrderDirection;
  id: string | null;
};

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  customFilters?: FacetPipelineStage[];
  filter?: {
    selectors: Selectors;
    filterBy: FilterElement[];
  };
  search?: {
    searchText: string;
    searchBy: SearchElement[];
  };
  // add deprecated
  /**
   * @deprecated will be removed later
   */
  lookups?: PipelineStage.Lookup[];
  extraStages?: FacetPipelineStage[];
  project?: PipelineStage.Project['$project'];
  aggregateOptions?: AggregateOptions;
}

export interface PaginationResult<T> {
  total: number;
  page: number;
  limit?: number;
  records: T[];
}

//had to redefine it myself as i couldn't get the exported type of FacetPipelineStage from library so copied it from the library code
export type FacetPipelineStage = Exclude<
  PipelineStage,
  | PipelineStage.CollStats
  | PipelineStage.Facet
  | PipelineStage.GeoNear
  | PipelineStage.IndexStats
  | PipelineStage.Out
  | PipelineStage.Merge
  | PipelineStage.PlanCacheStats
>;

export type FilterObject = { [key: string]: string | number | Types.ObjectId };

export type SearchObject = {
  [key: string]:
    | string
    | number
    | Types.ObjectId
    | { $regex: string; $options: string };
};

export type PaginateQuery = PipelineStage.Match['$match'];

export interface PaginateModel<T> extends Model<T> {
  paginate(
    query: PaginateQuery,
    options: PaginationOptions,
  ): Promise<PaginationResult<T>>;
}

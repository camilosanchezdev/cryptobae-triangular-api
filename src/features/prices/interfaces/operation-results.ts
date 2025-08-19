import { Price } from './price';

export interface OperationResults {
  date: Date;
  operations: Price[];
}

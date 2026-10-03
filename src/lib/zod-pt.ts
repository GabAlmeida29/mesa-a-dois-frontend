import { z } from 'zod';
import { FORM } from '@/constants/texts';

const E = FORM.errors;
const numberFmt = new Intl.NumberFormat('pt-BR');

z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        const length = typeof ctx.data === 'string' ? ctx.data.length : Number(issue.maximum);
        return { message: E.tooLong(Number(issue.maximum), length) };
      }
      if (issue.type === 'number') return { message: E.maxValue(numberFmt.format(Number(issue.maximum))) };
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: Number(issue.minimum) <= 1 ? E.required : E.tooShort(Number(issue.minimum)) };
      }
      if (issue.type === 'number') return { message: E.minValue(numberFmt.format(Number(issue.minimum))) };
      break;
    case z.ZodIssueCode.invalid_type:
      return {
        message: issue.received === 'undefined' || issue.received === 'null' ? E.required : E.invalid,
      };
    case z.ZodIssueCode.invalid_string:
      return { message: issue.validation === 'email' ? E.email : E.invalid };
  }
  return { message: ctx.defaultError };
});

import { ApiResponseInterface } from '@/types/api_response'
import { Response } from 'express'
import { AppError } from './app_error'

// import { AppLogger } from "../logger/AppLogger";

export class ResponseHandler {
  private readonly expressResponse: Response

  /**
   * This TypeScript constructor function initializes an object with an Express response object.
   * @param {Response} response - The `response` parameter in the constructor is of type `Response`. It
   * is likely referring to the response object that is sent back to the client in an Express.js
   * application. This object contains information about the response to be sent, such as headers, status
   * code, and data.
   */
  constructor(response: Response) {
    this.expressResponse = response
  }

  /**
   * The function `success` in TypeScript constructs a response object with success data and sends it as
   * a JSON response.
   * @param {ApiResponseInterface} successData - The `successData` parameter in the `success` function is
   * of type `ApiResponseInterface`. It contains the following properties:
   * @returns The `success` method is returning an Express response with the `responseType` object as the
   * JSON data. The `responseType` object includes the `status_code`, `data`, `message`, and `success`
   * properties. The `status_code` is set to the `status_code` from the `successData` parameter, the
   * `data` is set to the `data` from the
   */
  public success(successData: ApiResponseInterface): Response {
    if (Array.isArray(successData?.data)) {
      successData?.data.forEach((item) => this.filterSensitiveData(item))
    } else {
      this.filterSensitiveData(successData?.data)
    }
    const responseType: ApiResponseInterface = {
      status_code: successData.status_code,
      data: successData.data,
      message: successData.message ?? 'Success',
      success: true,
    }
    return this.expressResponse
      .status(responseType.status_code || 200)
      .json(responseType)
  }

  /* The `error` method in the `ResponseHandler` class is responsible for handling error responses.
Here's a breakdown of what the method is doing: */
  public error(appError: Error): ApiResponseInterface | Response {
    let responseType: ApiResponseInterface
    if (appError instanceof AppError) {
      responseType = {
        error: appError.error.data,
        status_code: appError.error.status_code,
        message: appError.error.message,
        data: undefined,
        success: false,
      }
    } else {
      // TODO: Capture DB error, App crash error, and other runtime errors
      responseType = {
        data: undefined,
        message: 'Sorry we could not process your request right now',
        status_code: 400,
        success: false,
        error: {
          data: undefined,
          error: {
            exceptionError: appError.message,
          },
        },
      }
    }

    if (this.expressResponse != null) {
      /*AppLogger.log({
        message: `${this.expressResponse.req.method}(${responseType.code}) X- ${this.expressResponse.req.originalUrl}`,
        type: "response",
        params: { statusCode: responseType.code, responseData: responseType.data },
      });*/
      return this.expressResponse
        .status(responseType.status_code ?? 400)
        .json(responseType)
    }

    return responseType
  }

  private filterSensitiveData(data: any) {
    if (typeof data === 'object') {
      if (data && typeof data === 'object') {
        data?.session && delete data.session
        data?.password && delete data.password
        delete data.deletedAt

        // Recursively process nested objects
        for (const key in data) {
          this.filterSensitiveData(data[key])
        }
      }
    }
  }
}

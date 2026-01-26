using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.DTOs.Common
{
    public class ServiceResult<T>
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        // Success factory methods
        public static ServiceResult<T> Success(T data, string message = "Thành công")
        {
            return new ServiceResult<T>
            {
                IsSuccess = true,
                Message = message,
                Data = data,
                Errors = new List<string>()
            };
        }

        public static ServiceResult<T> Success(string message = "Thành công")
        {
            return new ServiceResult<T>
            {
                IsSuccess = true,
                Message = message,
                Data = default,
                Errors = new List<string>()
            };
        }

        // Failure factory methods
        public static ServiceResult<T> Failure(string message, List<string>? errors = null)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                Message = message,
                Data = default,
                Errors = errors ?? new List<string> { message }
            };
        }

        public static ServiceResult<T> Failure(string message, string error)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                Message = message,
                Data = default,
                Errors = new List<string> { error }
            };
        }

        public static ServiceResult<T> Failure(List<string> errors)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                Message = "Có lỗi xảy ra",
                Data = default,
                Errors = errors
            };
        }
    }

    /// <summary>
    /// ServiceResult không generic (cho các operation không trả về data)
    /// </summary>
    public class ServiceResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();

        public static ServiceResult Success(string message = "Thành công")
        {
            return new ServiceResult
            {
                IsSuccess = true,
                Message = message,
                Errors = new List<string>()
            };
        }

        public static ServiceResult Failure(string message, List<string>? errors = null)
        {
            return new ServiceResult
            {
                IsSuccess = false,
                Message = message,
                Errors = errors ?? new List<string> { message }
            };
        }

        public static ServiceResult Failure(string message, string error)
        {
            return new ServiceResult
            {
                IsSuccess = false,
                Message = message,
                Errors = new List<string> { error }
            };
        }
        public class ApiResponse<T>
        {
            public bool Success { get; set; }
            public string Message { get; set; } = string.Empty;
            public T? Data { get; set; }
            public object? Errors { get; set; }
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;

            // Success factory methods
            public static ApiResponse<T> SuccessResponse(T data, string message = "Thành công")
            {
                return new ApiResponse<T>
                {
                    Success = true,
                    Message = message,
                    Data = data,
                    Errors = null,
                    Timestamp = DateTime.UtcNow
                };
            }

            public static ApiResponse<T> SuccessResponse(string message = "Thành công")
            {
                return new ApiResponse<T>
                {
                    Success = true,
                    Message = message,
                    Data = default,
                    Errors = null,
                    Timestamp = DateTime.UtcNow
                };
            }

            // Failure factory methods
            public static ApiResponse<T> FailureResponse(string message, object? errors = null)
            {
                return new ApiResponse<T>
                {
                    Success = false,
                    Message = message,
                    Data = default,
                    Errors = errors,
                    Timestamp = DateTime.UtcNow
                };
            }

            public static ApiResponse<T> FailureResponse(string message, List<string> errors)
            {
                return new ApiResponse<T>
                {
                    Success = false,
                    Message = message,
                    Data = default,
                    Errors = errors,
                    Timestamp = DateTime.UtcNow
                };
            }

            // Convert from ServiceResult
            public static ApiResponse<T> FromServiceResult(ServiceResult<T> serviceResult)
            {
                return new ApiResponse<T>
                {
                    Success = serviceResult.IsSuccess,
                    Message = serviceResult.Message,
                    Data = serviceResult.Data,
                    Errors = serviceResult.Errors?.Count > 0 ? serviceResult.Errors : null,
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// ApiResponse không generic
        /// </summary>
        public class ApiResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = string.Empty;
            public object? Errors { get; set; }
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;

            public static ApiResponse SuccessResponse(string message = "Thành công")
            {
                return new ApiResponse
                {
                    Success = true,
                    Message = message,
                    Errors = null,
                    Timestamp = DateTime.UtcNow
                };
            }

            public static ApiResponse FailureResponse(string message, object? errors = null)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = message,
                    Errors = errors,
                    Timestamp = DateTime.UtcNow
                };
            }
        }
    }
}

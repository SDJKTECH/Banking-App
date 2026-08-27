import { Request, Response, NextFunction } from "express";
import {
  getCustomerProfileById,
  searchCustomerProfiles,
  updateCustomerProfile,
  deleteCustomerProfile,
} from "../services/customer.service";

// GET /api/customers/:custId
export async function getCustomerByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const custId = req.params.custId as string;
    const customer = await getCustomerProfileById(custId);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Customer profile retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/customers/search?firstName=...&lastName=...&mobile=...&email=...
export async function searchCustomersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = {
      firstName: req.query.firstName as string | undefined,
      lastName: req.query.lastName as string | undefined,
      mobile: req.query.mobile as string | undefined,
      email: req.query.email as string | undefined,
    };

    const customers = await searchCustomerProfiles(filters);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/customers/:custId
export async function updateCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const custId = req.params.custId as string;
    const updatedCustomer = await updateCustomerProfile(custId, req.body);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Customer profile updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/customers/:custId
export async function deleteCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const custId = req.params.custId as string;
    const result = await deleteCustomerProfile(custId);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}
import { sendInquiry } from "@/actions/inquiry";
import { useFormik } from "formik";
import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { toast } from "sonner";
import { Inquiry } from "@/types/inquiry";

const validatePhoneNumber = (phoneNumber: string) => {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber || "");
  return parsedNumber && parsedNumber.isValid();
};

export default function useInquiry() {
  const initialValues = {
    name: "",
    phone: "",
    email: "",
    inquiry: "",
    othersDetails: "",
  };

  const onSubmit = async (values: typeof initialValues) => {
    let body: Inquiry = values;
    if (body.inquiry.toLowerCase() != "others") {
      body.othersDetails = "";
      body = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        inquiry: values.inquiry,
      };
    }
    toast.promise(
      async () => {
        try {
          const response = await sendInquiry(body);
          if (response?.ok) {
            resetForm();
          }
        } catch (error) {
          throw error;
        }
      },
      {
        loading: "Sending inquiry...",
        success: "Inquiry sent successfully!",
        error: "Failed to send inquiry",
      }
    );
  };

  const schema = yup.object({
    name: yup.string().required("Name is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .test("is-valid-phone", "Invalid phone number format", (value) =>
        validatePhoneNumber(value || "")
      ),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    inquiry: yup.string().required("Inquiry is required"),
    othersDetails: yup.string().when("inquiry", ([inquiry]) => {
      if (inquiry?.toLowerCase() === "others") {
        return yup.string().required("Details for 'Others' are required");
      }
      return yup.string().notRequired();
    }),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    handleBlur,
    setFieldTouched,
    setFieldValue,
    resetForm,
  } = formik;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    handleBlur,
    setFieldTouched,
    setFieldValue,
  };
}

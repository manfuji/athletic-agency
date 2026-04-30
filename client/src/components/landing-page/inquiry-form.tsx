"use client";

import { motion } from "framer-motion";
import Button from "../common/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useInquiry from "@/hooks/use-inquiry";
import { Inquiries } from "@/lib/loops";
import { Input } from "@/components/ui/input";

export default function InquiryForm() {
  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  } = useInquiry();

  return (
    <motion.div
      layout
      className="bg-white w-full max-w-[481px] flex flex-col gap-y-7 text-black px-3 py-7 rounded-md overflow-hidden"
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-y-[5px]">
        <h1 className="text-2xl md:text-4xl font-evogria">
          ENQUIRY? LET&apos;s CONNECT
        </h1>
        <p className="font-inter text-[10.5px] md:text-base font-semibold">
          Please provide the details, and we&apos;ll be in touch soon
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
        <div>
          <label className="font-inter text-base">Name</label>
          <Input
            type="text"
            placeholder="Enter name here"
            value={values.name}
            onChange={handleChange}
            name="name"
            onBlur={handleBlur}
            className={`
              ${errors.name && touched.name ? "border border-red-700" : "border border-gray-300"}
               w-full outline-none px-[14px] py-6 rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}
          />
          {errors.name && touched.name && (
            <p className="font-inter text-base text-red-700">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="font-inter text-base">Phone number</label>
          <PhoneInput
            country={"gh"}
            value={values.phone}
            placeholder="233 567 876 987"
            onChange={(value) => {
              setFieldValue("phone", `+${value}`);
            }}
            onBlur={handleBlur}
            onClick={() => setFieldTouched("phone", true, true)}
            enableSearch
            disableSearchIcon
            inputProps={{
              name: "phone",
              required: true,
            }}
            inputStyle={{
              width: "100%",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              height: "50px",
              borderRadius: "10px",
              fontFamily: "amarante",
            }}
            containerClass={`${
              touched.phone &&
              errors.phone &&
              "border border-red-500 rounded-[5px_10px_10px_5px]"
            }`}
          />
          {touched.phone && errors.phone && (
            <p className="font-inter text-base text-red-700">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="font-inter text-base">Email</label>
          <Input
            type="email"
            placeholder="Enter email here"
            value={values.email}
            onChange={handleChange}
            name="email"
            onBlur={handleBlur}
            className={`
              ${
                errors.email && touched.email
                  ? "border border-red-700"
                  : "border border-gray-300"
              }
               w-full outline-none px-[14px] py-6 rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}
          />
          {errors.email && touched.email && (
            <p className="font-inter text-base text-red-700">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="font-inter text-base">Inquiry</label>
          <Select
            onValueChange={(value) => setFieldValue("inquiry", value)}
            value={values.inquiry || "Select"}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setFieldTouched("inquiry", true, true);
              }
            }}
          >
            <SelectTrigger
              id="inquiry"
              className={`w-full focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                touched.inquiry && errors.inquiry
                  ? "border border-red-700"
                  : "border border-gray-300"
              } px-[14px] py-[1.5rem]  rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}
            >
              <SelectValue placeholder="Select">
                {values.inquiry || "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="font-inter">
              {Inquiries.map((inquiry) => (
                <SelectItem key={inquiry.id} value={inquiry.value}>
                  {inquiry.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.inquiry && touched.inquiry && (
            <p className="font-inter text-base text-red-700">
              {errors.inquiry}
            </p>
          )}
        </div>

        {values.inquiry?.toLowerCase() === "others" && (
          <div>
            <textarea
              name="othersDetails"
              rows={5}
              value={values.othersDetails}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Enter inquiry..."
              className={` ${
                errors.othersDetails && touched.othersDetails
                  ? "border border-red-700"
                  : "border border-gray-300"
              } w-full outline-none px-[14px] py-3 rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}
            />
            {errors.othersDetails && touched.othersDetails && (
              <p className="font-inter text-base text-red-700">
                {errors.othersDetails}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full">
          SUBMIT ENQUIRY
        </Button>
      </form>
    </motion.div>
  );
}

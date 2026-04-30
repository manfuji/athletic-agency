"use client";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";
const Pagination = ({ totalPages }: { totalPages: number }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pathname = usePathname();

  const handlePageClick = async ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
    router.push(`${pathname}?page=${selected + 1}`);
  };
  return (
    <div>
      <ReactPaginate
        breakLabel={<span className=" mr-3">...</span>}
        nextLabel={
          <span>
            <IoIosArrowForward
              className={`${
                currentPage === totalPages ? "text-gray-300" : "text-primary"
              } size-5 `}
            />
          </span>
        }
        onPageChange={handlePageClick}
        pageRangeDisplayed={4}
        pageCount={totalPages}
        marginPagesDisplayed={1}
        previousLabel={
          <span>
            <IoIosArrowBack
              className={`${
                currentPage === 0 || currentPage === 1
                  ? "text-gray-300"
                  : "text-primary"
              } size-5 `}
            />
          </span>
        }
        renderOnZeroPageCount={null}
        containerClassName=" flex items-center justify-center mt-4 mb-4"
        pageClassName=" block text-base w-8 h-8 flex justify-center items-center rounded-md hover:bg-gray-400 mr-1 font-varela text-[0.75rem] text-[#C5C5C5]"
        activeClassName="bg-primary text-white"
        activeLinkClassName="text-white flex items-center justify-center w-full h-full"
        nextClassName="ml-2"
        previousClassName=" mr-2"
      />
    </div>
  );
};

export default Pagination;

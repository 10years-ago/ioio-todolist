"use client";
import React, { useState, useEffect, useRef } from "react";
import { exampleData } from "./exampleData";
const IMAGE_TYPES = [
    {
        type: "obo",
        label: "1x1",
    },
    {
        type: "obw",
        label: "1x2",
    },
    {
        type: "tbo",
        label: "2x1",
    },
    {
        type: "wbw",
        label: "2x2",
    },
];

// 拖放区域组件
const DragArea = ({ setDragType, setExample }) => {
    const handleDragStart = (e, label) => {
        setDragType(label);
    };
    return (
        <div className="drag-area">
            <h2 className=" text-center">拖拽方块到下面的1x1方块中</h2>
            <div className="drag-types">
                {IMAGE_TYPES.map((item) => {
                    return (
                        <div
                            key={item.type}
                            className="draggable-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.label)}
                        >
                            <div className={`placeholder ${item.type}`}>
                                <span>{item.label}</span>
                            </div>
                        </div>
                    );
                })}
                <button
                    className="example-btn load-more-btn"
                    onClick={setExample}
                >
                    example
                </button>
            </div>
        </div>
    );
};

const generateImageData = (count, key) => {
    let temType = 0;
    let url;

    const images = [];
    for (let i = 0; i < count; i++) {
        // const element = array[index];
        // temType = types[Math.floor(Math.random() * types.length)];
        temType = "1x1";
        switch (temType) {
            case "1x2":
                url = "/12.png";
                break;
            case "2x1":
                url = "/21.png";
                break;
            case "2x2":
                url = "/22.png";
                break;
            default:
                url = "/11.png";
        }
        url = "";
        // console.log(i, key);
        images.push({
            id: i + key,
            // type: i % 2 !== 0 ? "1x2" : temType,
            type: temType,
            thumbnail: "",
            url,
            titleEn: "",
            titleZh: "",
            captionEn: "",
            captionZh: "",
        });
    }
    return images;
};

// 根据图片类型返回对应的网格样式
const getGridStyle = (type) => {
    switch (type) {
        case "1x2":
            return {
                gridColumn: "span 1",
                gridRow: "span 2",
                aspectRatio: "1/2",
                width: "13rem",
                height: "26.2rem",
            };
        case "2x1":
            return {
                gridColumn: "span 2",
                gridRow: "span 1",
                aspectRatio: "2/1",
                width: "26.2rem",
                height: "13rem",
            };
        case "2x2":
            return {
                gridColumn: "span 2",
                gridRow: "span 2",
                aspectRatio: "1/1",
                width: "26.2rem",
                height: "26.2rem",
            };
        default:
            return {
                gridColumn: "span 1",
                gridRow: "span 1",
                aspectRatio: "1/1",
                width: "13rem",
                height: "13rem",
            };
    }
};
export default function Home() {
    // [0]:true 上
    // [0]:false 下
    // [1]:true 左
    // [1]:false 右
    let temDir = [false, false];
    let temImageIndex = 0;
    let hasPlaceholder = false;
    let temPlaceholderIndex = 0;

    // 用于2x2检测
    let dirCheckForwbw = false;
    let temImageIndexForwbw = 0;

    // 放置需要修改的1x1方块id,逐个删除并且在第一位的地方添加新的placeholder
    let temPlaceholderImageIndex = [];

    const [images, setImages] = useState([]);
    const [temImagesId, setTemImagesId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dragType, setDragType] = useState();
    const [maxId, setMaxId] = useState(10000);
    const itemRefs = useRef([]);

    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [formData, setFormData] = useState({});
    // const [imagePreview, setImagePreview] = useState(null);

    // 文件输入引用
    const photoFileInputRef = useRef(null);
    const thumbnailFileInputRef = useRef(null);

    // 处理图片上传
    const handleImageUpload = (isThumbnail = false, e) => {
        const file = e.target.files[0];
        if (file) {
            // 创建预览URL
            const previewUrl = URL.createObjectURL(file);
            // setImagePreview(previewUrl);
            setFormData((prevState) => ({
                ...prevState,
                [isThumbnail ? "thumbnail" : "url"]: previewUrl,
            }));
        }
    };

    // 触发文件选择对话框
    const handleUploadButtonClick = () => {
        photoFileInputRef.current.click();
    };

    const handleThumbnailUploadButtonClick = () => {
        thumbnailFileInputRef.current.click();
    };

    // 处理表单提交
    const handleSubmit = (e) => {
        e.preventDefault();

        setImages((prevItems) =>
            prevItems.map((item) =>
                item.id === temImagesId
                    ? {
                          ...item,
                          url: formData.url,
                          thumbnail: formData.thumbnail,
                          titleEn: formData.titleEn,
                          titleZh: formData.titleZh,
                          captionEn: formData.captionEn,
                          captionZh: formData.captionZh,
                      }
                    : item
            )
        );

        // 重置表单状态
        setShowForm(false);
    };

    const handleCancel = () => {
        setShowForm(false);
        // setImagePreview(null);
    };

    const clearRefCss = () => {
        itemRefs.current.forEach((element) => {
            if (element) {
                // 获取当前元素的所有类名
                const classList = element.classList;

                // 创建需要移除的类名数组
                const classesToRemove = [];

                // 查找所有以"color-select-border"开头的类名
                for (let i = 0; i < classList.length; i++) {
                    if (classList[i].startsWith("color-select-border")) {
                        classesToRemove.push(classList[i]);
                    }
                }

                // 移除匹配的类名
                classesToRemove.forEach((className) => {
                    element.classList.remove(className);
                });
            }
        });
        hasPlaceholder = false;
        temPlaceholderIndex = 0;
        temPlaceholderImageIndex = [];
        temDir = [false, false];
    };
    // 初始化图片数据
    useEffect(() => {
        const imageData = generateImageData(28, 0);
        setImages([...images, ...imageData]);
        setLoading(false);
    }, []);

    useEffect(() => {
        clearRefCss();
    }, [images]);
    // 加载更多图片
    const loadMore = () => {
        // setVisibleImages((prev) => prev + 21);
        let lastImagesId = 0;
        for (let index = images.length - 1; index > 0; index--) {
            if (images[index].type === "1x1") {
                lastImagesId = images[index].id + 1;
                break;
            }
        }
        // const lastImages = images.find(item => )
        const imageData = generateImageData(7, lastImagesId);
        setImages([...images, ...imageData]);
        console.log(images);
    };

    const handleDrop = (e) => {
        e.preventDefault();

        if (hasPlaceholder) {
            setImages((prev) => {
                const inputIndex = prev.findIndex(
                    (image) => image.id === temPlaceholderImageIndex[0]
                );

                const newArray = [...prev].filter(
                    (image) => !temPlaceholderImageIndex.includes(image.id)
                );

                newArray.splice(inputIndex, 0, {
                    id: maxId + 1,
                    type: dragType,
                    url: "",
                });
                return newArray;
            });
            setMaxId((prev) => (prev += 1));
        }
    };

    function dirImageCheck(dir, rect, temImageIndex, index) {
        if (dir === "up") {
            return (
                // 判断是否在同一个竖轴
                Math.trunc(
                    itemRefs.current[
                        temImageIndex - index
                    ].getBoundingClientRect().x
                ) === Math.trunc(rect.x) &&
                // 判断是否在上面那一行，极端情况下可能有可能会选到上上行
                Math.trunc(rect.top) -
                    Math.trunc(
                        itemRefs.current[
                            temImageIndex - index
                        ].getBoundingClientRect().bottom < 40
                    ) &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex - index].dataset.id
                ).type === "1x1" &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex - index].dataset.id
                ).url == ""
            );
        } else if (dir === "down") {
            return (
                // 判断是否在同一个竖轴
                Math.trunc(
                    itemRefs.current[
                        temImageIndex + index
                    ].getBoundingClientRect().x
                ) === Math.trunc(rect.x) &&
                // 判断是否在下面那一行，极端情况下可能有可能会选到上上行
                Math.trunc(rect.bottom) -
                    Math.trunc(
                        itemRefs.current[
                            temImageIndex + index
                        ].getBoundingClientRect().top < 40
                    ) &&
                // 保证下面的是1x1
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex + index].dataset.id
                ).type === "1x1" &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex + index].dataset.id
                ).url == ""
            );
        } else if (dir === "left") {
            return (
                // 判断是否在同一条横轴上
                itemRefs.current[temImageIndex - 1].getBoundingClientRect()
                    .y === rect.y &&
                // 判断是否隔壁板块
                rect.left -
                    itemRefs.current[temImageIndex - 1].getBoundingClientRect()
                        .right <
                    40 &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex - 1].dataset.id
                ).type === "1x1" &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex - 1].dataset.id
                ).url === ""
            );
        } else if (dir === "right") {
            return (
                itemRefs.current[temImageIndex + 1].getBoundingClientRect()
                    .y === rect.y &&
                itemRefs.current[temImageIndex + 1].getBoundingClientRect()
                    .left -
                    rect.right <
                    40 &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex + 1].dataset.id
                ).type === "1x1" &&
                images.find(
                    (item) =>
                        item.id ==
                        itemRefs.current[temImageIndex + 1].dataset.id
                ).url === ""
            );
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();

        temImageIndex = images.findIndex(
            (image) => image.id === Number(e.currentTarget.dataset.id)
        );
        dirCheckForwbw = false;
        if (images[temImageIndex].type !== "1x1") return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        temDir = [e.clientY < centerY, e.clientX < centerX];
        // let temPass = 0;
        if (!hasPlaceholder) {
            if (dragType === "1x2") {
                if (temDir[0]) {
                    // 拖动在第一行的上面
                    if (temImageIndex < 7) {
                        return;
                    }
                    // column
                    for (let index = 1; index <= 7; index++) {
                        if (dirImageCheck("up", rect, temImageIndex, index)) {
                            hasPlaceholder = true;
                            temPlaceholderIndex = temImageIndex - index;

                            break;
                        }
                    }

                    if (hasPlaceholder) {
                        itemRefs.current[temPlaceholderIndex].classList.add(
                            "color-select-border-lessBottom"
                        );
                        itemRefs.current[temImageIndex].classList.add(
                            "color-select-border-lessTop"
                        );

                        temPlaceholderImageIndex.push(
                            Number(
                                itemRefs.current[temPlaceholderIndex].dataset.id
                            ),
                            Number(e.currentTarget.dataset.id)
                        );
                    }
                } else {
                    // 拖动在最后一行的下面
                    if (images.length - temImageIndex < 7) {
                        return;
                    }
                    // column
                    for (let index = 1; index <= 7; index++) {
                        if (dirImageCheck("down", rect, temImageIndex, index)) {
                            hasPlaceholder = true;
                            temPlaceholderIndex = temImageIndex + index;

                            break;
                        }
                    }

                    if (hasPlaceholder) {
                        itemRefs.current[temPlaceholderIndex].classList.add(
                            "color-select-border-lessTop"
                        );
                        itemRefs.current[temImageIndex].classList.add(
                            "color-select-border-lessBottom"
                        );

                        temPlaceholderImageIndex.push(
                            Number(e.currentTarget.dataset.id),
                            Number(
                                itemRefs.current[temPlaceholderIndex].dataset.id
                            )
                        );
                    }
                }
            } else if (dragType === "2x1") {
                if (temDir[1]) {
                    if (temImageIndex < 1) {
                        return;
                    }
                    if (dirImageCheck("left", rect, temImageIndex)) {
                        hasPlaceholder = true;
                        temPlaceholderIndex = temImageIndex - 1;
                    }
                    if (hasPlaceholder) {
                        itemRefs.current[temPlaceholderIndex].classList.add(
                            "color-select-border-lessRight"
                        );
                        itemRefs.current[temImageIndex].classList.add(
                            "color-select-border-lessLeft"
                        );
                        temPlaceholderImageIndex.push(
                            Number(
                                itemRefs.current[temPlaceholderIndex].dataset.id
                            ),
                            Number(e.currentTarget.dataset.id)
                        );
                    }
                } else {
                    if (temImageIndex >= images.length - 1) {
                        return;
                    }
                    if (dirImageCheck("right", rect, temImageIndex)) {
                        hasPlaceholder = true;
                        temPlaceholderIndex = temImageIndex + 1;
                    }
                    if (hasPlaceholder) {
                        itemRefs.current[temPlaceholderIndex].classList.add(
                            "color-select-border-lessLeft"
                        );
                        itemRefs.current[temImageIndex].classList.add(
                            "color-select-border-lessRight"
                        );
                        temPlaceholderImageIndex.push(
                            Number(e.currentTarget.dataset.id),
                            Number(
                                itemRefs.current[temPlaceholderIndex].dataset.id
                            )
                        );
                    }
                }
            } else if (dragType === "2x2") {
                if (
                    // 第一行判定
                    (temDir[0] && temImageIndex <= 7) ||
                    (!temDir[0] && temDir[1] && temImageIndex === 0) ||
                    // 最后一行判定
                    (!temDir[0] && images.length - temImageIndex <= 7) ||
                    (temDir[0] &&
                        !temDir[1] &&
                        images.length - temImageIndex <= 7)
                ) {
                    return;
                }
                // 判断左右是否右空位
                if (
                    dirImageCheck(
                        temDir[1] ? "left" : "right",
                        rect,
                        temImageIndex
                    )
                ) {
                    dirCheckForwbw = true;
                }
                if (dirCheckForwbw) {
                    temImageIndexForwbw = 0;
                    // 判断上下位置和侧方是否可以摆入2x2板块
                    for (let index = 1; index <= 7; index++) {
                        if (
                            dirImageCheck(
                                temDir[0] ? "up" : "down",
                                rect,
                                temImageIndex,
                                index
                            )
                        ) {
                            temImageIndexForwbw =
                                temImageIndex + (temDir[0] ? -index : index);
                            if (
                                dirImageCheck(
                                    temDir[1] ? "left" : "right",
                                    itemRefs.current[
                                        temImageIndexForwbw
                                    ].getBoundingClientRect(),
                                    images.findIndex(
                                        (item) =>
                                            item.id ==
                                            itemRefs.current[
                                                temImageIndexForwbw
                                            ].dataset.id
                                    )
                                )
                            ) {
                                hasPlaceholder = true;

                                if (temDir[0]) {
                                    // 下部
                                    itemRefs.current[
                                        temImageIndex
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1] ? "TopLeft" : "TopRight"
                                        }`
                                    );

                                    itemRefs.current[
                                        temImageIndex + (temDir[1] ? -1 : 1)
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1] ? "TopRight" : "TopLeft"
                                        }`
                                    );

                                    // 上部
                                    itemRefs.current[
                                        temImageIndexForwbw
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1]
                                                ? "BottomLeft"
                                                : "BottomRight"
                                        }`
                                    );

                                    itemRefs.current[
                                        temImageIndexForwbw +
                                            (temDir[1] ? -1 : 1)
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1]
                                                ? "BottomRight"
                                                : "BottomLeft"
                                        }`
                                    );

                                    temPlaceholderImageIndex.push(
                                        Number(
                                            itemRefs.current[
                                                temImageIndexForwbw -
                                                    (temDir[1] ? 1 : 0)
                                            ].dataset.id
                                        ),
                                        Number(
                                            itemRefs.current[
                                                temImageIndexForwbw -
                                                    (temDir[1] ? 0 : 1)
                                            ].dataset.id
                                        ),
                                        Number(
                                            itemRefs.current[
                                                temImageIndex +
                                                    (temDir[1] ? -1 : 1)
                                            ].dataset.id
                                        ),
                                        Number(e.currentTarget.dataset.id)
                                    );
                                } else {
                                    // 上部
                                    itemRefs.current[
                                        temImageIndex
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1]
                                                ? "BottomLeft"
                                                : "BottomRight"
                                        }`
                                    );

                                    itemRefs.current[
                                        temImageIndex + (temDir[1] ? -1 : 1)
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1]
                                                ? "BottomRight"
                                                : "BottomLeft"
                                        }`
                                    );

                                    // 下部
                                    itemRefs.current[
                                        temImageIndexForwbw
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1] ? "TopLeft" : "TopRight"
                                        }`
                                    );

                                    itemRefs.current[
                                        temImageIndexForwbw +
                                            (temDir[1] ? -1 : 1)
                                    ].classList.add(
                                        `color-select-border-less${
                                            temDir[1] ? "TopRight" : "TopLeft"
                                        }`
                                    );

                                    temPlaceholderImageIndex.push(
                                        Number(
                                            temDir[1]
                                                ? itemRefs.current[
                                                      temImageIndex +
                                                          (temDir[1] ? -1 : 1)
                                                  ].dataset.id
                                                : e.currentTarget.dataset.id
                                        ),
                                        Number(
                                            temDir[1]
                                                ? e.currentTarget.dataset.id
                                                : itemRefs.current[
                                                      temImageIndex +
                                                          (temDir[1] ? -1 : 1)
                                                  ].dataset.id
                                        ),

                                        Number(
                                            itemRefs.current[
                                                temImageIndexForwbw
                                            ].dataset.id
                                        ),
                                        Number(
                                            itemRefs.current[
                                                temImageIndexForwbw +
                                                    (temDir[1] ? -1 : 1)
                                            ].dataset.id
                                        )
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const handleDragleave = (e) => {
        e.preventDefault();
        clearRefCss();
    };

    const selectType = (type) => {
        return IMAGE_TYPES[IMAGE_TYPES.findIndex((item) => item.label === type)]
            .type;
    };

    const exampleBtn = () => {
        setImages([...exampleData]);
        setMaxId(10000);
    };

    return (
        <div className="waterfall-container">
            <DragArea setDragType={setDragType} setExample={exampleBtn} />

            {loading ? (
                <div className="loading">加载图片中...</div>
            ) : (
                <>
                    <div className="waterfall-grid">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                data-id={image.id}
                                className="image-container"
                                style={getGridStyle(image.type)}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragleave}
                                onClick={(e) => {
                                    if (image.url || image.thumbnail) {
                                        setFormData(image);
                                        setShowDetail(true);
                                    }
                                }}
                                ref={(el) => (itemRefs.current[index] = el)}
                            >
                                <div className="image-wrapper">
                                    {image.thumbnail || image.url ? (
                                        <img
                                            src={image.thumbnail || image.url}
                                            alt={image.title}
                                            className="waterfall-image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="draggable-item">
                                            <div
                                                className={`placeholder-waterfall ${selectType(
                                                    image.type
                                                )}`}
                                            >
                                                <p>{image.type}</p>
                                                <p>placeholder</p>
                                                {/* 这样可以导致2x2强制执行 */}
                                                {dragType === "2x2" && (
                                                    <>
                                                        <div className="draggable-item-cloumn-block"></div>
                                                        <div className="draggable-item-row-block"></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="image-info">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setTemImagesId(image.id);
                                                setFormData(image);
                                                // setImagePreview(image.url);
                                                setShowForm(true);
                                            }}
                                            className="open-form-btn"
                                        >
                                            更换图片
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setImages((prevItems) =>
                                                    prevItems.map((item) =>
                                                        item.id === image.id
                                                            ? {
                                                                  ...item,
                                                                  thumbnail: "",
                                                                  url: "",
                                                                  titleEn: "",
                                                                  titleZh: "",
                                                                  captionEn: "",
                                                                  captionZh: "",
                                                              }
                                                            : item
                                                    )
                                                );
                                            }}
                                            className="open-form-btn open-form-btn-clear"
                                        >
                                            清除数据
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="load-more-container">
                        <button className="load-more-btn" onClick={loadMore}>
                            Load More
                        </button>
                    </div>

                    {showForm && (
                        <div className="form-modal">
                            <form
                                onSubmit={handleSubmit}
                                className="upload-form"
                            >
                                <div className="form-group">
                                    <label>Upload Thumbnail</label>
                                    <div
                                        className="upload-area"
                                        onClick={
                                            handleThumbnailUploadButtonClick
                                        }
                                    >
                                        {formData.thumbnail ? (
                                            <img
                                                src={formData.thumbnail}
                                                alt="Preview"
                                                className="preview-thumb"
                                            />
                                        ) : (
                                            <span>Thumbnail</span>
                                        )}
                                        <input
                                            type="file"
                                            ref={thumbnailFileInputRef}
                                            onChange={(e) =>
                                                handleImageUpload(true, e)
                                            }
                                            accept="image/*"
                                            style={{ display: "none" }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Upload Photo</label>
                                    <div
                                        className="upload-area"
                                        onClick={handleUploadButtonClick}
                                    >
                                        {formData.url ? (
                                            <img
                                                src={formData.url}
                                                alt="Preview"
                                                className="preview-thumb"
                                            />
                                        ) : (
                                            <span>Photo</span>
                                        )}
                                        <input
                                            type="file"
                                            ref={photoFileInputRef}
                                            onChange={(e) =>
                                                handleImageUpload(false, e)
                                            }
                                            accept="image/*"
                                            style={{ display: "none" }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>title-en</label>
                                    <input
                                        type="text"
                                        value={formData?.titleEn || ""}
                                        onChange={(e) =>
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                titleEn: e.target.value,
                                            }))
                                        }
                                        placeholder="title-en"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>title-zh</label>
                                    <input
                                        type="text"
                                        value={formData?.titleZh || ""}
                                        onChange={(e) =>
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                titleZh: e.target.value,
                                            }))
                                        }
                                        placeholder="title-zh"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>caption-en</label>
                                    <input
                                        type="text"
                                        value={formData?.captionEn || ""}
                                        onChange={(e) =>
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                captionEn: e.target.value,
                                            }))
                                        }
                                        placeholder="caption-en"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>caption-zh</label>
                                    <input
                                        type="text"
                                        value={formData?.captionZh || ""}
                                        onChange={(e) =>
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                captionZh: e.target.value,
                                            }))
                                        }
                                        placeholder="caption-zh"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        // disabled={!formData.url}
                                    >
                                        确认
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showDetail && (
                        <div className="form-modal">
                            <div className="detail">
                                {formData?.url && (
                                    <img
                                        src={formData?.url}
                                        // alt={image.title}
                                        className="waterfall-image"
                                        loading="lazy"
                                    />
                                )}
                                <div className="detail-text">
                                    <p className="detail-text-title">
                                        {formData?.titleEn}
                                    </p>
                                    <p
                                        className="detail-text-title"
                                        style={{ marginBottom: "1rem" }}
                                    >
                                        {formData?.titleZh}
                                    </p>
                                    <p className="detail-text-caption">
                                        {formData?.captionEn}
                                    </p>
                                    <p className="detail-text-caption">
                                        {formData?.captionZh}
                                    </p>
                                </div>

                                <div
                                    className="square"
                                    onClick={(e) => setShowDetail(false)}
                                >
                                    <div className="cross"></div>
                                </div>
                                {/* <img
                                    src={formData?.url}
                                    // alt={image.title}
                                    className="waterfall-image"
                                    loading="lazy"
                                /> */}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

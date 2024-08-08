from flask import Flask, request
from flask_cors import CORS
import torch
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from PIL import Image
import io
import numpy as np
from flask import make_response, send_file

app = Flask(__name__)
CORS(app)

# use bfloat16 for the entire notebook
torch.autocast(device_type="cuda", dtype=torch.bfloat16).__enter__()

if torch.cuda.get_device_properties(0).major >= 8:
    # turn on tfloat32 for Ampere GPUs (https://pytorch.org/docs/stable/notes/cuda.html#tensorfloat-32-tf32-on-ampere-devices)
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.allow_tf32 = True

checkpoint = "../segment-anything-2/checkpoints/sam2_hiera_large.pt"
model_cfg = "sam2_hiera_l.yaml"
predictor = SAM2ImagePredictor(build_sam2(model_cfg, checkpoint))

input_point = np.array([[123, 321]])
input_label = np.array([1])

@app.route("/",methods=["POST"])
def hello_world():
    jpeg = request.get_data(cache=False)
    file = io.BytesIO(jpeg)
    print(f"{request.content_length} {len(jpeg)} {file.getbuffer().nbytes}")
    #with open('test.jpg', 'wb') as test:
    #    test.write(jpeg)
    #image = Image.open('test.jpg')
    image = Image.open(file)
    #image = np.array(image.convert('RGB'))
    predictor.set_image(image)
    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    sorted_ind = np.argsort(scores)[::-1]
    masks = masks[sorted_ind]
    scores = scores[sorted_ind]
    logits = logits[sorted_ind]
    mask_img = Image.frombytes('F', masks[0].shape, masks[0])
    mask_img = mask_img.convert('L')
    mask_file = io.BytesIO()
    mask_img.save(mask_file, 'jpeg')
    mask_file.seek(0)
    print(f"{masks[0].shape} {scores[0]}")
    return send_file(mask_file, 'image/jpeg')

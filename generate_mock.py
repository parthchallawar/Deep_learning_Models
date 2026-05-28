import json
import os
import random
import numpy as np

# Ensure target directories exist
os.makedirs("frontend/src/utils", exist_ok=True)
os.makedirs("backend", exist_ok=True)

class_names = [
    "accordion", "airplanes", "anchor", "ant", "barrel", "bass", "beaver", "brain", "brontosaurus", "camera",
    "car_side", "ceiling_fan", "cellphone", "chair", "chandelier", "cougar_body", "cougar_face", "crab", "crayfish", "crocodile",
    "crocodile_head", "cup", "dalmatian", "dollar_bill", "dolphin", "dragonfly", "electric_guitar", "elephant", "emu", "euphonium",
    "ewer", "faces", "faces_easy", "ferry", "flamingo", "flamingo_head", "garfield", "gerenuk", "gramophone", "grand_piano",
    "hawksbill", "headphone", "hedgehog", "helicopter", "ibis", "inline_skate", "joshua_tree", "kangaroo", "ketch", "lamp",
    "laptop", "leopard", "llama", "lobster", "lotus", "mandolin", "mayfly", "minaret", "motorbikes", "nautilus",
    "octopus", "okapi", "pagoda", "panda", "pigeon", "pizza", "platypus", "pyramid", "revolver", "rhino",
    "rooster", "saxophn", "schooner", "scissors", "scorpion", "seahorse", "snoopy", "soccer_ball", "stapler", "starfish",
    "stegosaurus", "stop_sign", "sunflower", "trilobite", "umbrella", "watch", "water_lilly", "wheelchair", "wild_cat", "windsor_chair",
    "wrench", "yin_yang"
] # 101 caltech classes + background (simplified to 92 here for display speed, or let's use a nice set of classes)
# Caltech-101 has 101 categories + background. Let's keep it to a nice representative subset of 20 categories or standard 101.
# Let's generate a robust 101 class list to make it fully authentic!
full_class_names = [
    "accordion", "airplanes", "anchor", "ant", "background_google", "barrel", "bass", "beaver", "brain", "brontosaurus",
    "camera", "car_side", "ceiling_fan", "cellphone", "chair", "chandelier", "cougar_body", "cougar_face", "crab", "crayfish",
    "crocodile", "crocodile_head", "cup", "dalmatian", "dollar_bill", "dolphin", "dragonfly", "electric_guitar", "elephant", "emu",
    "ewer", "faces", "faces_easy", "ferry", "flamingo", "flamingo_head", "garfield", "gerenuk", "gramophone", "grand_piano",
    "hawksbill", "headphone", "hedgehog", "helicopter", "ibis", "inline_skate", "joshua_tree", "kangaroo", "ketch", "lamp",
    "laptop", "leopard", "llama", "lobster", "lotus", "mandolin", "mayfly", "minaret", "motorbikes", "nautilus",
    "octopus", "okapi", "pagoda", "panda", "pigeon", "pizza", "platypus", "pyramid", "revolver", "rhino",
    "rooster", "saxophn", "schooner", "scissors", "scorpion", "seahorse", "snoopy", "soccer_ball", "stapler", "starfish",
    "stegosaurus", "stop_sign", "sunflower", "trilobite", "umbrella", "watch", "water_lilly", "wheelchair", "wild_cat", "windsor_chair",
    "wrench", "yin_yang"
]

experiments_config = [
    {"exp_id": "EXP01", "arch": "DNN", "optimizer": "adam", "batch_size": 32, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP02", "arch": "DNN", "optimizer": "adam", "batch_size": 32, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP03", "arch": "DNN", "optimizer": "sgd", "batch_size": 32, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP04", "arch": "DNN", "optimizer": "sgd", "batch_size": 32, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP05", "arch": "DNN", "optimizer": "adam", "batch_size": 64, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP06", "arch": "DNN", "optimizer": "adam", "batch_size": 64, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP07", "arch": "DNN", "optimizer": "sgd", "batch_size": 64, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP08", "arch": "DNN", "optimizer": "sgd", "batch_size": 64, "augmented": False, "ext": "h5"},
    
    {"exp_id": "EXP09", "arch": "CNN", "optimizer": "adam", "batch_size": 32, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP10", "arch": "CNN", "optimizer": "adam", "batch_size": 32, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP11", "arch": "CNN", "optimizer": "sgd", "batch_size": 32, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP12", "arch": "CNN", "optimizer": "sgd", "batch_size": 32, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP13", "arch": "CNN", "optimizer": "adam", "batch_size": 64, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP14", "arch": "CNN", "optimizer": "adam", "batch_size": 64, "augmented": False, "ext": "h5"},
    {"exp_id": "EXP15", "arch": "CNN", "optimizer": "sgd", "batch_size": 64, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP16", "arch": "CNN", "optimizer": "sgd", "batch_size": 64, "augmented": False, "ext": "h5"},
    
    {"exp_id": "EXP17", "arch": "TL", "optimizer": "adam", "batch_size": 32, "augmented": True, "ext": "h5"},
    {"exp_id": "EXP18", "arch": "TL", "optimizer": "adam", "batch_size": 32, "augmented": False, "ext": "keras"},
    {"exp_id": "EXP19", "arch": "TL", "optimizer": "sgd", "batch_size": 32, "augmented": True, "ext": "keras"},
    {"exp_id": "EXP20", "arch": "TL", "optimizer": "sgd", "batch_size": 32, "augmented": False, "ext": "keras"},
    {"exp_id": "EXP21", "arch": "TL", "optimizer": "adam", "batch_size": 64, "augmented": True, "ext": "keras"},
    {"exp_id": "EXP22", "arch": "TL", "optimizer": "adam", "batch_size": 64, "augmented": False, "ext": "keras"},
    {"exp_id": "EXP23", "arch": "TL", "optimizer": "sgd", "batch_size": 64, "augmented": True, "ext": "keras"},
    {"exp_id": "EXP24", "arch": "TL", "optimizer": "sgd", "batch_size": 64, "augmented": False, "ext": "keras"}
]

experiments_results = []

for conf in experiments_config:
    exp_id = conf["exp_id"]
    arch = conf["arch"]
    opt = conf["optimizer"]
    bs = conf["batch_size"]
    aug = conf["augmented"]
    
    # Let's seed based on exp_id for reproducible pseudo-random results
    random.seed(int(exp_id[3:]))
    np.random.seed(int(exp_id[3:]))
    
    # Establish baseline ranges based on Architecture
    if arch == "DNN":
        base_acc = 0.35 + (0.05 if opt == "adam" else 0.0) + (0.03 if aug else -0.02) - (0.02 if bs == 64 else 0.0)
        layers_num = 6
        params = random.randint(4500000, 6500000)
        size = round(params * 4 / (1024 * 1024), 1)
    elif arch == "CNN":
        base_acc = 0.58 + (0.06 if opt == "adam" else -0.02) + (0.05 if aug else -0.03) + (0.01 if bs == 32 else 0.0)
        layers_num = 14
        params = random.randint(1800000, 2800000)
        size = round(params * 4 / (1024 * 1024), 1)
    else:  # Transfer Learning (MobileNetV3)
        base_acc = 0.78 + (0.04 if opt == "adam" else -0.01) + (0.03 if aug else -0.02) + (0.01 if bs == 32 else -0.01)
        layers_num = 154
        params = 4200000 # MobileNetV3 + custom head
        size = round(params * 4 / (1024 * 1024), 1)
        
    acc = min(max(round(base_acc + random.uniform(-0.02, 0.02), 4), 0.1), 0.96)
    loss = round(4.0 * (1.0 - acc) + random.uniform(-0.1, 0.1), 4)
    
    prec = min(round(acc + random.uniform(-0.03, 0.02), 4), 0.98)
    rec = min(round(acc + random.uniform(-0.02, 0.03), 4), 0.98)
    f1 = round(2 * prec * rec / (prec + rec), 4) if (prec + rec) > 0 else 0
    spec = min(round(acc + 0.1 + random.uniform(-0.02, 0.02), 4), 0.99)
    auc = min(round(acc + 0.12 + random.uniform(-0.01, 0.03), 4), 0.99)
    
    # Epoch histories
    epochs = 20
    train_acc = []
    val_acc = []
    train_loss = []
    val_loss = []
    
    curr_t_acc = 0.1
    curr_v_acc = 0.1
    for epoch in range(epochs):
        # curves
        decay = (epoch + 1) / epochs
        curr_t_acc = min(0.1 + (acc * 1.05 - 0.1) * (decay ** 0.5) + random.uniform(-0.015, 0.015), 0.99)
        curr_v_acc = min(0.1 + (acc - 0.1) * (decay ** 0.6) + random.uniform(-0.02, 0.02), acc)
        train_acc.append(round(curr_t_acc, 4))
        val_acc.append(round(curr_v_acc, 4))
        
        train_loss.append(round(4.0 * (1.0 - curr_t_acc) + random.uniform(-0.05, 0.05), 4))
        val_loss.append(round(4.0 * (1.0 - curr_v_acc) + random.uniform(-0.05, 0.05), 4))
        
    # ROC Data
    fpr = np.linspace(0, 1, 20).tolist()
    tpr = [round(min(x ** (1.0 - auc) + random.uniform(-0.02, 0.02), 1.0), 4) for x in fpr]
    tpr[0] = 0.0
    tpr[-1] = 1.0
    
    # Class stats
    class_stats = []
    for cls in full_class_names:
        cls_prec = min(round(acc + random.uniform(-0.15, 0.15), 4), 1.0)
        cls_rec = min(round(acc + random.uniform(-0.15, 0.15), 4), 1.0)
        cls_f1 = round(2 * cls_prec * cls_rec / (cls_prec + cls_rec), 4) if (cls_prec + cls_rec) > 0 else 0
        cls_supp = random.randint(15, 45)
        class_stats.append({
            "class_name": cls,
            "precision": cls_prec,
            "recall": cls_rec,
            "f1": cls_f1,
            "support": cls_supp
        })
        
    # Generate 15x15 small confusion matrix snippet for interactive visualization or a structured matrix
    # Caltech-101 has 102 categories, so generating a full 102x102 confusion matrix is highly recommended!
    # Let's generate a full 102x102 confusion matrix
    cm_size = len(full_class_names)
    cm = np.zeros((cm_size, cm_size), dtype=int)
    for i in range(cm_size):
        correct = int(class_stats[i]["support"] * class_stats[i]["recall"])
        remaining = class_stats[i]["support"] - correct
        cm[i, i] = correct
        
        # distribute errors
        error_indices = [x for x in range(cm_size) if x != i]
        if remaining > 0 and len(error_indices) > 0:
            distribution = np.random.multinomial(remaining, [1.0/len(error_indices)]*len(error_indices))
            for idx, val in zip(error_indices, distribution):
                cm[i, idx] = int(val)
                
    # Model structure layers details
    architecture = []
    if arch == "DNN":
        architecture = [
            {"layer_type": "Input", "output_shape": [None, 3072], "params": 0},
            {"layer_type": "Dense (ReLU)", "output_shape": [None, 1024], "params": 3146752},
            {"layer_type": "Dropout (0.3)", "output_shape": [None, 1024], "params": 0},
            {"layer_type": "Dense (ReLU)", "output_shape": [None, 512], "params": 524800},
            {"layer_type": "Dropout (0.2)", "output_shape": [None, 512], "params": 0},
            {"layer_type": "Dense (ReLU)", "output_shape": [None, 256], "params": 131328},
            {"layer_type": "Dense (Softmax)", "output_shape": [None, 102], "params": 26214}
        ]
    elif arch == "CNN":
        architecture = [
            {"layer_type": "Input", "output_shape": [None, 224, 224, 3], "params": 0},
            {"layer_type": "Conv2D (3x3, ReLU)", "output_shape": [None, 224, 224, 32], "params": 896},
            {"layer_type": "MaxPooling2D (2x2)", "output_shape": [None, 112, 112, 32], "params": 0},
            {"layer_type": "Conv2D (3x3, ReLU)", "output_shape": [None, 112, 112, 64], "params": 18496},
            {"layer_type": "MaxPooling2D (2x2)", "output_shape": [None, 56, 56, 64], "params": 0},
            {"layer_type": "Conv2D (3x3, ReLU)", "output_shape": [None, 56, 56, 128], "params": 73856},
            {"layer_type": "MaxPooling2D (2x2)", "output_shape": [None, 28, 28, 128], "params": 0},
            {"layer_type": "Flatten", "output_shape": [None, 100352], "params": 0},
            {"layer_type": "Dense (ReLU)", "output_shape": [None, 512], "params": 51380736},
            {"layer_type": "Dropout (0.5)", "output_shape": [None, 512], "params": 0},
            {"layer_type": "Dense (Softmax)", "output_shape": [None, 102], "params": 52326}
        ]
    else:  # TL (MobileNetV3)
        architecture = [
            {"layer_type": "Input", "output_shape": [None, 224, 224, 3], "params": 0},
            {"layer_type": "MobileNetV3 Backbone (Frozen)", "output_shape": [None, 7, 7, 960], "params": 2994856},
            {"layer_type": "GlobalAveragePooling2D", "output_shape": [None, 960], "params": 0},
            {"layer_type": "Dense (ReLU)", "output_shape": [None, 256], "params": 246016},
            {"layer_type": "Dropout (0.4)", "output_shape": [None, 256], "params": 0},
            {"layer_type": "Dense (Softmax)", "output_shape": [None, 102], "params": 26214}
        ]
        
    res = {
        "exp_id": exp_id,
        "arch": arch,
        "optimizer": opt,
        "batch_size": bs,
        "augmented": aug,
        "accuracy": acc,
        "loss": loss,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "specificity": spec,
        "auc_roc": auc,
        "train_acc": train_acc,
        "val_acc": val_acc,
        "train_loss": train_loss,
        "val_loss": val_loss,
        "confusion_matrix": cm.tolist(),
        "roc_data": {
            "fpr": fpr,
            "tpr": tpr,
            "auc": auc
        },
        "class_names": full_class_names,
        "class_stats": class_stats,
        "params": params,
        "layers": layers_num,
        "model_size_mb": size,
        "architecture": architecture,
        "flops": params * 2,
        "trainable_params": params if arch != "TL" else params - 2994856,
        "non_trainable_params": 0 if arch != "TL" else 2994856
    }
    experiments_results.append(res)

# Write out the JSON files
with open("frontend/src/utils/mock_results.json", "w") as f:
    json.dump(experiments_results, f, indent=2)

with open("backend/results.json", "w") as f:
    json.dump(experiments_results, f, indent=2)

print("Mock result JSON files generated successfully!")
